package com.siscoca.controller;

import com.siscoca.dto.UserDto;
import com.siscoca.model.AuditEntity;
import com.siscoca.model.Rol;
import com.siscoca.model.Usuario;
import com.siscoca.service.AuditLogger;
import com.siscoca.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class UsuarioController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private AuditLogger auditLogger;
    
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
     * Lista de roles disponibles con sus nombres amigables
     */
    @GetMapping("/roles")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Map<String, String>>> getRolesDisponibles() {
        List<Map<String, String>> roles = Arrays.stream(Rol.values())
                .map(rol -> {
                    Map<String, String> datos = new LinkedHashMap<>();
                    datos.put("codigo", rol.name());
                    datos.put("nombre", rol.getDisplayName());
                    return datos;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }
    
    /**
     * Obtiene usuarios activos para derivación de tareas (accesible para usuarios autenticados)
     */
    @GetMapping("/activos")
    public ResponseEntity<List<UserDto>> getUsuariosActivos() {
        List<Usuario> usuarios = usuarioService.findActivos();
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
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("usuario", resumenUsuario(savedUsuario));
        auditLogger.log(
                AuditEntity.USUARIOS,
                "Crear",
                String.valueOf(savedUsuario.getId()),
                "Usuario creado",
                detalles
        );
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
        
        Map<String, Object> datosAntes = resumenUsuario(existingUsuario);
        
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
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("antes", datosAntes);
        detalles.put("despues", resumenUsuario(updatedUsuario));
        auditLogger.log(
                AuditEntity.USUARIOS,
                "Actualizar",
                String.valueOf(updatedUsuario.getId()),
                "Usuario actualizado",
                detalles
        );
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
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("usuario", resumenUsuario(usuario));
        auditLogger.log(
                AuditEntity.USUARIOS,
                "Desactivar",
                String.valueOf(id),
                "Usuario desactivado",
                detalles
        );
        
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
    
    private Map<String, Object> resumenUsuario(Usuario usuario) {
        Map<String, Object> data = new LinkedHashMap<>();
        if (usuario == null) {
            return data;
        }
        data.put("id", usuario.getId());
        data.put("username", usuario.getUsername());
        data.put("nombre", usuario.getNombre());
        data.put("iniciales", usuario.getIniciales());
        data.put("rol", usuario.getRol() != null ? usuario.getRol().getDisplayName() : null);
        data.put("activo", usuario.getActivo());
        return data;
    }
}





