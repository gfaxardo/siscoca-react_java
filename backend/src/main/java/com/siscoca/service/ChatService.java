package com.siscoca.service;

import com.siscoca.dto.MensajeChatDto;
import com.siscoca.model.AuditEntity;
import com.siscoca.model.Campana;
import com.siscoca.model.MensajeChat;
import com.siscoca.repository.MensajeChatRepository;
import com.siscoca.repository.CampanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {
    
    @Autowired
    private MensajeChatRepository mensajeRepository;
    
    @Autowired
    private CampanaRepository campanaRepository;
    
    @Autowired
    private AuditLogger auditLogger;
    
    /**
     * Envía un nuevo mensaje a una campaña
     */
    public MensajeChatDto enviarMensaje(Long campanaId, String remitente, String mensaje, Boolean urgente) {
        Campana campana = campanaRepository.findById(campanaId)
                .orElseThrow(() -> new IllegalArgumentException("Campaña no encontrada"));
        
        MensajeChat mensajeChat = new MensajeChat();
        mensajeChat.setCampana(campana);
        mensajeChat.setRemitente(remitente);
        mensajeChat.setMensaje(mensaje);
        mensajeChat.setUrgente(urgente != null ? urgente : false);
        mensajeChat.setLeido(false);
        mensajeChat.setFechaCreacion(LocalDateTime.now());
        
        MensajeChat mensajeGuardado = mensajeRepository.save(mensajeChat);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("campanaId", campanaId);
        detalles.put("remitente", remitente);
        detalles.put("urgente", mensajeGuardado.getUrgente());
        auditLogger.logManual(
                remitente,
                null,
                AuditEntity.CHAT,
                "Enviar mensaje",
                String.valueOf(mensajeGuardado.getId()),
                "Mensaje enviado a la campaña",
                detalles
        );
        return convertToDto(mensajeGuardado);
    }
    
    /**
     * Obtiene todos los mensajes de una campaña
     */
    public List<MensajeChatDto> getMensajesPorCampana(Long campanaId) {
        return mensajeRepository.findByCampanaIdOrderByFechaCreacionAsc(campanaId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Marca un mensaje como leído
     */
    public void marcarMensajeComoLeido(Long mensajeId) {
        MensajeChat mensaje = mensajeRepository.findById(mensajeId)
                .orElseThrow(() -> new IllegalArgumentException("Mensaje no encontrado"));
        
        mensaje.setLeido(true);
        MensajeChat guardado = mensajeRepository.save(mensaje);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("mensaje", resumenMensaje(guardado));
        auditLogger.log(
                AuditEntity.CHAT,
                "Marcar leído",
                String.valueOf(mensajeId),
                "Mensaje marcado como leído",
                detalles
        );
    }
    
    /**
     * Marca todos los mensajes de una campaña como leídos
     */
    public void marcarTodosComoLeidos(Long campanaId, String username) {
        List<MensajeChat> mensajes = mensajeRepository.findByCampanaIdOrderByFechaCreacionAsc(campanaId);
        
        int marcados = 0;
        for (MensajeChat mensaje : mensajes) {
            // Solo marcar como leído si no es el remitente
            if (!mensaje.getRemitente().equals(username) && !mensaje.getLeido()) {
                mensaje.setLeido(true);
                mensajeRepository.save(mensaje);
                marcados++;
            }
        }
        
        if (marcados > 0) {
            Map<String, Object> detalles = new LinkedHashMap<>();
            detalles.put("campanaId", campanaId);
            detalles.put("mensajesMarcados", marcados);
            detalles.put("usuario", username);
            auditLogger.logManual(
                    username,
                    null,
                    AuditEntity.CHAT,
                    "Marcar todos como leídos",
                    String.valueOf(campanaId),
                    "Mensajes de la campaña marcados como leídos",
                    detalles
            );
        }
    }
    
    /**
     * Obtiene el conteo de mensajes no leídos para un usuario
     */
    public Long getMensajesNoLeidosPorUsuario(String username) {
        return mensajeRepository.countCampañasConMensajesSinLeer(username);
    }
    
    /**
     * Obtiene el conteo de mensajes no leídos de una campaña específica
     */
    public Long getMensajesNoLeidosPorCampana(Long campanaId) {
        return mensajeRepository.countMensajesNoLeidosPorCampana(campanaId);
    }
    
    /**
     * Obtiene la lista de mensajes no leídos para un usuario
     */
    public List<MensajeChatDto> getListaMensajesNoLeidosPorUsuario(String username) {
        List<MensajeChat> mensajes = mensajeRepository.findByLeidoFalse();
        return mensajes.stream()
                .filter(m -> !m.getRemitente().equals(username))
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene todos los mensajes no leídos (para administradores)
     */
    public Long getAllMensajesNoLeidos() {
        return mensajeRepository.countMensajesNoLeidos();
    }
    
    /**
     * Obtiene la lista de todos los mensajes no leídos (para administradores)
     */
    public List<MensajeChatDto> getAllListaMensajesNoLeidos() {
        List<MensajeChat> mensajes = mensajeRepository.findByLeidoFalse();
        return mensajes.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene el conteo de mensajes no leídos para todas las campañas en una sola consulta
     * Retorna un Map donde la clave es el ID de la campaña (Long) y el valor es el conteo (Long)
     */
    public java.util.Map<Long, Long> getMensajesNoLeidosPorTodasLasCampanas() {
        List<Object[]> resultados = mensajeRepository.countMensajesNoLeidosPorCampanaAgrupado();
        java.util.Map<Long, Long> conteos = new java.util.HashMap<>();
        
        for (Object[] resultado : resultados) {
            Long campanaId = (Long) resultado[0];
            Long count = (Long) resultado[1];
            conteos.put(campanaId, count);
        }
        
        return conteos;
    }
    
    /**
     * Convierte MensajeChat a DTO
     */
    private MensajeChatDto convertToDto(MensajeChat mensaje) {
        MensajeChatDto dto = new MensajeChatDto();
        dto.setId(mensaje.getId());
        dto.setCampanaId(mensaje.getCampana().getId());
        dto.setCampanaNombre(mensaje.getCampana().getNombre());
        dto.setRemitente(mensaje.getRemitente());
        dto.setMensaje(mensaje.getMensaje());
        dto.setLeido(mensaje.getLeido());
        dto.setUrgente(mensaje.getUrgente());
        dto.setFechaCreacion(mensaje.getFechaCreacion());
        return dto;
    }
    
    private Map<String, Object> resumenMensaje(MensajeChat mensaje) {
        Map<String, Object> data = new LinkedHashMap<>();
        if (mensaje == null) {
            return data;
        }
        data.put("id", mensaje.getId());
        data.put("campanaId", mensaje.getCampana() != null ? mensaje.getCampana().getId() : null);
        data.put("remitente", mensaje.getRemitente());
        data.put("leido", mensaje.getLeido());
        data.put("urgente", mensaje.getUrgente());
        data.put("fechaCreacion", mensaje.getFechaCreacion());
        return data;
    }
}

