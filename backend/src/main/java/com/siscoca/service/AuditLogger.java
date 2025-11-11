package com.siscoca.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.siscoca.model.AuditEntity;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collection;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuditLogger {

    private final LoggingService loggingService;
    private final ObjectMapper objectMapper;
    private final ObjectProvider<HttpServletRequest> requestProvider;

    public AuditLogger(LoggingService loggingService,
                       ObjectMapper objectMapper,
                       ObjectProvider<HttpServletRequest> requestProvider) {
        this.loggingService = loggingService;
        this.objectMapper = objectMapper;
        this.requestProvider = requestProvider;
    }

    public void log(AuditEntity entidad, String accion, String entidadId, String descripcion, Object detalles) {
        logInternal(null, null, entidad, accion, entidadId, descripcion, detalles);
    }

    public void log(AuditEntity entidad, String accion, String entidadId, Object detalles) {
        logInternal(null, null, entidad, accion, entidadId, null, detalles);
    }

    public void logManual(String usuario, String rol, AuditEntity entidad, String accion,
                          String entidadId, String descripcion, Object detalles) {
        logInternal(usuario, rol, entidad, accion, entidadId, descripcion, detalles);
    }

    private void logInternal(String usuario, String rol, AuditEntity entidad, String accion,
                             String entidadId, String descripcion, Object detalles) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        String resolvedUsuario = resolveUsuario(usuario, authentication);
        String resolvedRol = resolveRol(rol, authentication);

        HttpServletRequest request = requestProvider.getIfAvailable();
        String ipAddress = resolveClientIp(request);
        String userAgent = request != null ? request.getHeader("User-Agent") : null;
        String sessionId = request != null ? request.getRequestedSessionId() : null;

        String descripcionFinal = descripcion != null && !descripcion.isBlank()
                ? descripcion
                : accion;

        String detallesJson = convertToJson(detalles);

        loggingService.crearLog(
                resolvedUsuario,
                resolvedRol,
                accion,
                entidad != null ? entidad.getDisplayName() : AuditEntity.SISTEMA.getDisplayName(),
                entidadId,
                descripcionFinal,
                detallesJson,
                ipAddress,
                userAgent,
                sessionId
        );
    }

    private String resolveUsuario(String usuario, Authentication authentication) {
        if (usuario != null && !usuario.isBlank()) {
            return usuario;
        }
        if (authentication == null || !Boolean.TRUE.equals(authentication.isAuthenticated())) {
            return "Sistema";
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            return userDetails.getUsername();
        }
        return Optional.ofNullable(authentication.getName()).filter(name -> !"anonymousUser".equalsIgnoreCase(name))
                .orElse("Sistema");
    }

    private String resolveRol(String rol, Authentication authentication) {
        if (rol != null && !rol.isBlank()) {
            return rol;
        }
        if (authentication == null || authentication.getAuthorities() == null) {
            return "Sistema";
        }
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        if (authorities.isEmpty()) {
            return "Sistema";
        }
        Set<String> roles = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .filter(Objects::nonNull)
                .map(auth -> auth.startsWith("ROLE_") ? auth.substring(5) : auth)
                .collect(Collectors.toCollection(java.util.LinkedHashSet::new));
        return String.join(",", roles);
    }

    private String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String header = request.getHeader("X-Forwarded-For");
        if (header != null && !header.isBlank()) {
            return header.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String convertToJson(Object detalles) {
        if (detalles == null) {
            return null;
        }
        if (detalles instanceof String str) {
            return str;
        }
        try {
            return objectMapper.writeValueAsString(detalles);
        } catch (JsonProcessingException e) {
            return detalles.toString();
        }
    }
}

