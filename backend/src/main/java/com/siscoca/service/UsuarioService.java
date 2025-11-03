package com.siscoca.service;

import com.siscoca.dto.LoginRequest;
import com.siscoca.dto.LoginResponse;
import com.siscoca.dto.UserDto;
import com.siscoca.model.Usuario;
import com.siscoca.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            Optional<Usuario> usuarioOpt = usuarioRepository.findByUsernameAndActivoTrue(loginRequest.getUsername());
            
            if (usuarioOpt.isEmpty()) {
                return new LoginResponse(false, "Usuario no encontrado o inactivo");
            }
            
            Usuario usuario = usuarioOpt.get();
            
            if (!passwordEncoder.matches(loginRequest.getPassword(), usuario.getPassword())) {
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
            
            return new LoginResponse(true, token, userDto, jwtService.getExpirationTime());
            
        } catch (Exception e) {
            return new LoginResponse(false, "Error interno del servidor: " + e.getMessage());
        }
    }
    
    public Optional<Usuario> findByUsername(String username) {
        return usuarioRepository.findByUsername(username);
    }
    
    public Usuario save(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        return usuarioRepository.save(usuario);
    }
    
    public boolean existsByUsername(String username) {
        return usuarioRepository.existsByUsername(username);
    }
    
    public List<Usuario> findAll() {
        return usuarioRepository.findAll();
    }
    
    public Optional<Usuario> findById(Long id) {
        return usuarioRepository.findById(id);
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
            throw new IllegalArgumentException("Usuario no encontrado o inactivo");
        }
        
        Usuario usuario = usuarioOpt.get();
        
        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(currentPassword, usuario.getPassword())) {
            return false;
        }
        
        // Encriptar y guardar la nueva contraseña
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);
        
        return true;
    }
}
