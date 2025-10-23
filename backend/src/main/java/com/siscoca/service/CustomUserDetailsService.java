package com.siscoca.service;

import com.siscoca.model.Usuario;
import com.siscoca.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Primero intentar buscar en la base de datos local
        Usuario usuario = usuarioRepository.findByUsername(username).orElse(null);
        
        if (usuario != null) {
            // Usuario local encontrado
            return new User(
                usuario.getUsername(),
                usuario.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name()))
            );
        } else {
            // Usuario externo (de Yego API) - crear usuario temporal
            return new User(
                username,
                "", // No hay password para usuarios externos
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_TRAFFICKER"))
            );
        }
    }
}
