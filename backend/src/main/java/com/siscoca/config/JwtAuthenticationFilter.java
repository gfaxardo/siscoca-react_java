package com.siscoca.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.siscoca.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        final String authHeader = request.getHeader("Authorization");
        
        // Si no hay header de autenticación, continuar (puede ser una ruta pública)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        // Extraer el token
        final String jwt = authHeader.substring(7);
        
        try {
            // Validar que el token no esté vacío
            if (jwt == null || jwt.trim().isEmpty()) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token vacío");
                return;
            }
            
            // Extraer username del token
            String username = jwtService.extractUsername(jwt);
            
            if (username == null) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
                return;
            }
            
            // Verificar si el token es válido
            if (!jwtService.validateToken(jwt)) {
                sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token expirado o inválido");
                return;
            }
            
            // Cargar detalles del usuario y verificar
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token inválido o no coincide con el usuario");
                    return;
                }
            }
            
            // Continuar con la cadena de filtros
            filterChain.doFilter(request, response);
            
        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            logger.error("Token expirado: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Sesión expirada. Por favor, inicia sesión nuevamente.");
        } catch (io.jsonwebtoken.JwtException e) {
            logger.error("Error procesando token JWT: {}", e.getMessage());
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Token inválido");
        } catch (Exception e) {
            logger.error("Error inesperado en autenticación: {}", e.getMessage(), e);
            sendErrorResponse(response, HttpServletResponse.SC_UNAUTHORIZED, "Error de autenticación");
        }
    }
    
    private void sendErrorResponse(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", true);
        errorResponse.put("message", message);
        errorResponse.put("status", status);
        
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
