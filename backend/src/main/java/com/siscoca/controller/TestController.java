package com.siscoca.controller;

import com.siscoca.model.Usuario;
import com.siscoca.model.Rol;
import com.siscoca.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/test")
public class TestController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @PostMapping("/create-user")
    public ResponseEntity<String> crearUsuarioPrueba() {
        try {
            // Crear usuario de prueba
            Usuario usuario = new Usuario();
            usuario.setUsername("admin");
            usuario.setPassword("admin");
            usuario.setNombre("Administrador");
            usuario.setRol(Rol.ADMIN);
            usuario.setActivo(true);
            
            usuarioService.save(usuario);
            
            return ResponseEntity.ok("Usuario creado exitosamente: admin/admin");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creando usuario: " + e.getMessage());
        }
    }
}
