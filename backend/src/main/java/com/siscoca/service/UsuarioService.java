package com.siscoca.service;

import com.siscoca.dto.LoginRequest;
import com.siscoca.dto.LoginResponse;
import com.siscoca.dto.UserDto;
import com.siscoca.model.Usuario;
import com.siscoca.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
}
