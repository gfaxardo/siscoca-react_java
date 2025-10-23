package com.siscoca.controller;

import com.siscoca.dto.LoginRequest;
import com.siscoca.dto.LoginResponse;
import com.siscoca.dto.UserDto;
import com.siscoca.service.UsuarioService;
import com.siscoca.service.JwtService;
import com.siscoca.model.Usuario;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {
    
    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private JwtService jwtService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Validar credenciales con la API de Yego
            RestTemplate restTemplate = new RestTemplate();
            String yegoApiUrl = "https://api-int.yego.pro/api/auth/login";
            
            // Preparar headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Preparar el JSON con username y password en el orden correcto
            Map<String, String> credentials = new HashMap<>();
            credentials.put("username", loginRequest.getUsername());
            credentials.put("password", loginRequest.getPassword());
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(credentials, headers);
            
            // Hacer la petición a Yego
            Map<String, Object> yegoResponse = restTemplate.postForObject(yegoApiUrl, request, Map.class);
            
            if (yegoResponse != null && yegoResponse.containsKey("accessToken")) {
                // Credenciales válidas, generar token JWT local
                String localToken = jwtService.generateToken(loginRequest.getUsername());
                
                // Crear usuario local
                Usuario usuario = new Usuario();
                usuario.setUsername(loginRequest.getUsername());
                usuario.setNombre(loginRequest.getUsername());
                usuario.setRol(com.siscoca.model.Rol.TRAFFICKER); // Rol por defecto
                
                // Crear UserDto para la respuesta
                UserDto userDto = new UserDto();
                userDto.setId(usuario.getId());
                userDto.setUsername(usuario.getUsername());
                userDto.setNombre(usuario.getNombre());
                userDto.setRol(usuario.getRol().getDisplayName());
                
                LoginResponse response = new LoginResponse();
                response.setSuccess(true);
                response.setAccessToken(localToken);
                response.setUser(userDto);
                response.setMessage("Login exitoso");
                
                return ResponseEntity.ok(response);
            } else {
                LoginResponse response = new LoginResponse();
                response.setSuccess(false);
                response.setMessage("Credenciales incorrectas");
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            LoginResponse response = new LoginResponse();
            response.setSuccess(false);
            response.setMessage("Error de conexión con el servidor de autenticación");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // En una implementación real, podrías invalidar el token
        return ResponseEntity.ok("Logout exitoso");
    }
}
