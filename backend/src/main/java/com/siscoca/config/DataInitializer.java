package com.siscoca.config;

import com.siscoca.model.Rol;
import com.siscoca.model.Usuario;
import com.siscoca.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@Order(1)
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
        // Crear o actualizar usuarios por defecto
        crearOActualizarUsuario("gfajardo", "siscoca2024", "Gonzalo Fajardo", "GF", Rol.ADMIN);
        
        if (usuarioRepository.count() == 0 || !usuarioRepository.findByUsername("acruz").isPresent()) {
            
            // MKT: Ariana de la Cruz
            Usuario mkt = new Usuario();
            mkt.setUsername("acruz");
            mkt.setPassword(passwordEncoder.encode("siscoca2024"));
            mkt.setNombre("Ariana de la Cruz");
            mkt.setIniciales("AC");
            mkt.setRol(Rol.MKT);
            mkt.setActivo(true);
            usuarioRepository.save(mkt);
            
            // TRAFFICKER: Rayedel Ortega
            Usuario trafficker = new Usuario();
            trafficker.setUsername("rortega");
            trafficker.setPassword(passwordEncoder.encode("siscoca2024"));
            trafficker.setNombre("Rayedel Ortega");
            trafficker.setIniciales("RO");
            trafficker.setRol(Rol.TRAFFICKER);
            trafficker.setActivo(true);
            usuarioRepository.save(trafficker);
            
            // DUEÑOS
            Usuario dueno1 = new Usuario();
            dueno1.setUsername("gfajardo2"); // Gonzalo es DUEÑO y ADMIN (puede tener 2 usuarios)
            dueno1.setPassword(passwordEncoder.encode("siscoca2024"));
            dueno1.setNombre("Gonzalo Fajardo");
            dueno1.setIniciales("GF");
            dueno1.setRol(Rol.DUEÑO);
            dueno1.setActivo(true);
            usuarioRepository.save(dueno1);
            
            Usuario dueno2 = new Usuario();
            dueno2.setUsername("fhuarilloclla");
            dueno2.setPassword(passwordEncoder.encode("siscoca2024"));
            dueno2.setNombre("Frank Huarilloclla");
            dueno2.setIniciales("FH");
            dueno2.setRol(Rol.DUEÑO);
            dueno2.setActivo(true);
            usuarioRepository.save(dueno2);
            
            Usuario dueno3 = new Usuario();
            dueno3.setUsername("dvaldivia");
            dueno3.setPassword(passwordEncoder.encode("siscoca2024"));
            dueno3.setNombre("Diego Valdivia");
            dueno3.setIniciales("DV");
            dueno3.setRol(Rol.DUEÑO);
            dueno3.setActivo(true);
            usuarioRepository.save(dueno3);
            
            Usuario dueno4 = new Usuario();
            dueno4.setUsername("mpineda");
            dueno4.setPassword(passwordEncoder.encode("siscoca2024"));
            dueno4.setNombre("Martha Pineda");
            dueno4.setIniciales("MP");
            dueno4.setRol(Rol.DUEÑO);
            dueno4.setActivo(true);
            usuarioRepository.save(dueno4);
            
            Usuario dueno5 = new Usuario();
            dueno5.setUsername("jochoa");
            dueno5.setPassword(passwordEncoder.encode("siscoca2024"));
            dueno5.setNombre("Jhajaira Ochoa");
            dueno5.setIniciales("JO");
            dueno5.setRol(Rol.DUEÑO);
            dueno5.setActivo(true);
            usuarioRepository.save(dueno5);
            
            System.out.println("=== USUARIOS DE SISCOCA CREADOS ===");
            System.out.println("ADMIN:");
            System.out.println("  Gonzalo Fajardo (GF) - gfajardo:siscoca2024");
            System.out.println("\nMKT:");
            System.out.println("  Ariana de la Cruz (AC) - acruz:siscoca2024");
            System.out.println("\nTRAFFICKER:");
            System.out.println("  Rayedel Ortega (RO) - rortega:siscoca2024");
            System.out.println("\nDUEÑOS:");
            System.out.println("  Gonzalo Fajardo (GF) - gfajardo2:siscoca2024");
            System.out.println("  Frank Huarilloclla (FH) - fhuarilloclla:siscoca2024");
            System.out.println("  Diego Valdivia (DV) - dvaldivia:siscoca2024");
            System.out.println("  Martha Pineda (MP) - mpineda:siscoca2024");
            System.out.println("  Jhajaira Ochoa (JO) - jochoa:siscoca2024");
            System.out.println("==================================");
        }
    }
    
    private void crearOActualizarUsuario(String username, String password, String nombre, String iniciales, Rol rol) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(username);
        
        if (usuarioOpt.isPresent()) {
            // Si el usuario existe, actualizar sus datos
            Usuario usuario = usuarioOpt.get();
            usuario.setPassword(passwordEncoder.encode(password));
            usuario.setNombre(nombre);
            usuario.setIniciales(iniciales);
            usuario.setRol(rol);
            usuario.setActivo(true); // Asegurar que esté activo
            usuarioRepository.save(usuario);
            System.out.println("Usuario " + username + " actualizado correctamente");
        } else {
            // Si no existe, crearlo
            Usuario usuario = new Usuario();
            usuario.setUsername(username);
            usuario.setPassword(passwordEncoder.encode(password));
            usuario.setNombre(nombre);
            usuario.setIniciales(iniciales);
            usuario.setRol(rol);
            usuario.setActivo(true);
            usuarioRepository.save(usuario);
            System.out.println("Usuario " + username + " creado correctamente");
        }
    }
}


