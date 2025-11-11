package com.siscoca.service;

import com.siscoca.dto.LoginRequest;
import com.siscoca.dto.LoginResponse;
import com.siscoca.dto.UserDto;
import com.siscoca.model.AuditEntity;
import com.siscoca.model.Usuario;
import com.siscoca.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private AuditLogger auditLogger;
    
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByUsernameAndActivoTrue(loginRequest.getUsername());
            
            if (usuarioOpt.isEmpty()) {
                auditLogger.logManual(
                        loginRequest.getUsername(),
                        null,
                        AuditEntity.AUTH,
                        "Login fallido",
                        loginRequest.getUsername(),
                        "Usuario no encontrado o inactivo",
                        Map.of("motivo", "USUARIO_NO_ENCONTRADO")
                );
                return new LoginResponse(false, "Usuario no encontrado o inactivo");
            }
            
            Usuario usuario = usuarioOpt.get();
            
            if (!passwordEncoder.matches(loginRequest.getPassword(), usuario.getPassword())) {
                auditLogger.logManual(
                        loginRequest.getUsername(),
                        usuario.getRol() != null ? usuario.getRol().getDisplayName() : null,
                        AuditEntity.AUTH,
                        "Login fallido",
                        loginRequest.getUsername(),
                        "Contraseña incorrecta",
                        Map.of("motivo", "PASSWORD_INCORRECTO")
                );
                return new LoginResponse(false, "Contraseña incorrecta");
            }
            
            String token = jwtService.generateToken(usuario.getUsername());
            UserDto userDto = new UserDto(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNombre(),
                usuario.getIniciales(),
                usuario.getRol().getDisplayName()
            );
            
            auditLogger.logManual(
                    usuario.getUsername(),
                    usuario.getRol() != null ? usuario.getRol().getDisplayName() : null,
                    AuditEntity.AUTH,
                    "Login exitoso",
                    usuario.getUsername(),
                    "Inicio de sesión exitoso",
                    Map.of(
                            "expiraEn", jwtService.getExpirationTime(),
                            "usuarioId", usuario.getId()
                    )
            );
            
            return new LoginResponse(true, token, userDto, jwtService.getExpirationTime());
            
        } catch (Exception e) {
            auditLogger.logManual(
                    loginRequest.getUsername(),
                    null,
                    AuditEntity.AUTH,
                    "Login fallido",
                    loginRequest.getUsername(),
                    "Error interno del servidor",
                    Map.of("error", e.getMessage())
            );
            return new LoginResponse(false, "Error interno del servidor: " + e.getMessage());
        }
    }
    
    public Optional<Usuario> findByUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }
    
    public Usuario save(Usuario usuario) {
        if (usuario.getPassword() != null && !usuario.getPassword().isBlank()) {
            String password = usuario.getPassword();
            if (!isPasswordEncoded(password)) {
                usuario.setPassword(passwordEncoder.encode(password));
            }
        }
        return usuarioRepository.save(usuario);
    }
    
    public boolean existsByUsername(String username) {
        return usuarioRepository.existsByUsername(username);
    }

    private boolean isPasswordEncoded(String password) {
        return password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$");
    }
    
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }
    
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
    }
    
    public List<Usuario> findActivos() {
        return usuarioRepository.findByActivoTrue();
    }
    
    /**
     * Cambia la contraseña del usuario autenticado
     * @param username El username del usuario que quiere cambiar su contraseña
     * @param currentPassword La contraseña actual
     * @param newPassword La nueva contraseña
     * @return true si el cambio fue exitoso, false si la contraseña actual es incorrecta
     */
    public boolean cambiarContrasena(String username, String currentPassword, String newPassword) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsernameAndActivoTrue(username);
        
        if (usuarioOpt.isEmpty()) {
            auditLogger.logManual(
                    username,
                    null,
                    AuditEntity.USUARIOS,
                    "Cambio de contraseña fallido",
                    username,
                    "Usuario no encontrado o inactivo",
                    Map.of("motivo", "USUARIO_NO_ENCONTRADO")
            );
            throw new IllegalArgumentException("Usuario no encontrado o inactivo");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
            auditLogger.logManual(
                    username,
                    usuario.getRol() != null ? usuario.getRol().getDisplayName() : null,
                    AuditEntity.USUARIOS,
                    "Cambio de contraseña fallido",
                    String.valueOf(usuario.getId()),
                    "Contraseña actual incorrecta",
                    Map.of("motivo", "PASSWORD_INCORRECTO")
            );
            return false;
        }
        
        // Encriptar y guardar la nueva contraseña
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);
        
        auditLogger.logManual(
                username,
                usuario.getRol() != null ? usuario.getRol().getDisplayName() : null,
                AuditEntity.USUARIOS,
                "Cambio de contraseña",
                String.valueOf(usuario.getId()),
                "Contraseña actualizada correctamente",
                Map.of()
        );
        
        return true;
    }
}
