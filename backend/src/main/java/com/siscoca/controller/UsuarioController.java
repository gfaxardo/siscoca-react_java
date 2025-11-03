package com.siscoca.controller;

import com.siscoca.dto.UserDto;
import com.siscoca.model.Usuario;
import com.siscoca.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    /**
     * Obtiene todos los usuarios (solo ADMIN)
     */
    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsuarios() {
        List<Usuario> usuarios = usuarioService.findAll();
        List<UserDto> userDtos = usuarios.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }
    
    /**
     * Obtiene un usuario por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUsuarioById(@PathVariable Long id) {
        Usuario usuario = usuarioService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        return ResponseEntity.ok(convertToDto(usuario));
    }
    
    /**
     * Crea un nuevo usuario (solo ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserDto> createUsuario(@RequestBody Usuario usuario) {
        if (usuarioService.existsByUsername(usuario.getUsername())) {
            throw new IllegalArgumentException("El username ya existe");
        }
        Usuario savedUsuario = usuarioService.save(usuario);
        return ResponseEntity.ok(convertToDto(savedUsuario));
    }
    
    /**
     * Actualiza un usuario (solo ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<UserDto> updateUsuario(@PathVariable Long id, @RequestBody Usuario usuario) {
        Usuario existingUsuario = usuarioService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        // Actualizar campos permitidos
        existingUsuario.setNombre(usuario.getNombre());
        existingUsuario.setIniciales(usuario.getIniciales());
        existingUsuario.setRol(usuario.getRol());
        existingUsuario.setActivo(usuario.getActivo());
        
        // Solo actualizar password si se proporciona
        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            existingUsuario.setPassword(usuario.getPassword());
        }
        
        Usuario updatedUsuario = usuarioService.save(existingUsuario);
        return ResponseEntity.ok(convertToDto(updatedUsuario));
    }
    
    /**
     * Elimina un usuario (solo ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        // En lugar de eliminar físicamente, marcamos como inactivo
        usuario.setActivo(false);
        usuarioService.save(usuario);
        
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Convierte Usuario a DTO
     */
    private UserDto convertToDto(Usuario usuario) {
        return new UserDto(
            usuario.getId(),
            usuario.getUsername(),
            usuario.getNombre(),
            usuario.getIniciales(),
            usuario.getRol().getDisplayName()
        );
    }
}


