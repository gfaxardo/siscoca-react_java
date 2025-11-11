package com.siscoca.controller;

import com.siscoca.dto.MensajeChatDto;
import com.siscoca.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class ChatController {
    
    @Autowired
    private ChatService chatService;
    
    /**
     * Envía un mensaje a una campaña
     */
    @PostMapping("/enviar")
    public ResponseEntity<MensajeChatDto> enviarMensaje(@RequestBody Map<String, Object> request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String remitente = authentication.getName();
        
        Long campanaId = Long.valueOf(request.get("campanaId").toString());
        String mensaje = request.get("mensaje").toString();
        Boolean urgente = request.containsKey("urgente") ? Boolean.valueOf(request.get("urgente").toString()) : false;
        
        MensajeChatDto mensajeEnviado = chatService.enviarMensaje(campanaId, remitente, mensaje, urgente);
        return ResponseEntity.ok(mensajeEnviado);
    }
    
    /**
     * Obtiene todos los mensajes de una campaña
     */
    @GetMapping("/campana/{campanaId}")
    public ResponseEntity<List<MensajeChatDto>> getMensajesPorCampana(@PathVariable Long campanaId) {
        List<MensajeChatDto> mensajes = chatService.getMensajesPorCampana(campanaId);
        return ResponseEntity.ok(mensajes);
    }
    
    /**
     * Marca un mensaje como leído
     */
    @PutMapping("/mensaje/{mensajeId}/leer")
    public ResponseEntity<String> marcarMensajeComoLeido(@PathVariable Long mensajeId) {
        chatService.marcarMensajeComoLeido(mensajeId);
        return ResponseEntity.ok("Mensaje marcado como leído");
    }
    
    /**
     * Marca todos los mensajes de una campaña como leídos
     */
    @PutMapping("/campana/{campanaId}/marcar-leidos")
    public ResponseEntity<String> marcarTodosComoLeidos(@PathVariable Long campanaId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        chatService.marcarTodosComoLeidos(campanaId, username);
        return ResponseEntity.ok("Todos los mensajes marcados como leídos");
    }
    
    /**
     * Obtiene el conteo de mensajes no leídos para el usuario autenticado
     */
    @GetMapping("/no-leidos")
    public ResponseEntity<Long> getMensajesNoLeidos() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Long count = chatService.getMensajesNoLeidosPorUsuario(username);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Obtiene el conteo de mensajes no leídos de una campaña específica
     */
    @GetMapping("/campana/{campanaId}/no-leidos")
    public ResponseEntity<Long> getMensajesNoLeidosPorCampana(@PathVariable Long campanaId) {
        Long count = chatService.getMensajesNoLeidosPorCampana(campanaId);
        return ResponseEntity.ok(count);
    }
    
    /**
     * Obtiene todos los mensajes no leídos del usuario autenticado
     */
    @GetMapping("/mensajes-no-leidos")
    public ResponseEntity<List<MensajeChatDto>> getMensajesNoLeidosList() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        List<MensajeChatDto> mensajes = chatService.getListaMensajesNoLeidosPorUsuario(username);
        return ResponseEntity.ok(mensajes);
    }
    
    /**
     * Obtiene todos los mensajes no leídos (para administradores)
     */
    @GetMapping("/todos-no-leidos")
    public ResponseEntity<Long> getAllMensajesNoLeidos() {
        Long count = chatService.getAllMensajesNoLeidos();
        return ResponseEntity.ok(count);
    }
    
    /**
     * Obtiene la lista de todos los mensajes no leídos (para administradores)
     */
    @GetMapping("/todos-mensajes-no-leidos")
    public ResponseEntity<List<MensajeChatDto>> getAllMensajesNoLeidosList() {
        List<MensajeChatDto> mensajes = chatService.getAllListaMensajesNoLeidos();
        return ResponseEntity.ok(mensajes);
    }
    
    /**
     * Obtiene el conteo de mensajes no leídos para todas las campañas en una sola consulta
     * Optimizado para reducir el número de consultas SQL
     */
    @GetMapping("/todos-no-leidos-por-campana")
    public ResponseEntity<Map<Long, Long>> getMensajesNoLeidosPorTodasLasCampanas() {
        Map<Long, Long> conteos = chatService.getMensajesNoLeidosPorTodasLasCampanas();
        return ResponseEntity.ok(conteos);
    }
}

