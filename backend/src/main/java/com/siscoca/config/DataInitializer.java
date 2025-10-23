package com.siscoca.config;

import com.siscoca.model.Rol;
import com.siscoca.model.Usuario;
import com.siscoca.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        inicializarUsuarios();
    }
    
    private void inicializarUsuarios() {
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setNombre("Administrador");
            admin.setRol(Rol.ADMIN);
            admin.setActivo(true);
            usuarioRepository.save(admin);
            
            Usuario trafficker = new Usuario();
            trafficker.setUsername("trafficker");
            trafficker.setPassword(passwordEncoder.encode("trafficker123"));
            trafficker.setNombre("Trafficker");
            trafficker.setRol(Rol.TRAFFICKER);
            trafficker.setActivo(true);
            usuarioRepository.save(trafficker);
            
            Usuario dueno = new Usuario();
            dueno.setUsername("dueno");
            dueno.setPassword(passwordEncoder.encode("dueno123"));
            dueno.setNombre("Dueño");
            dueno.setRol(Rol.DUEÑO);
            dueno.setActivo(true);
            usuarioRepository.save(dueno);
            
            System.out.println("=== USUARIOS DE PRUEBA CREADOS ===");
            System.out.println("Admin - Username: admin, Password: admin123");
            System.out.println("Trafficker - Username: trafficker, Password: trafficker123");
            System.out.println("Dueño - Username: dueno, Password: dueno123");
            System.out.println("==================================");
        }
    }
}


