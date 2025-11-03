package com.siscoca.service;

import com.siscoca.dto.MensajeChatDto;
import com.siscoca.model.Campana;
import com.siscoca.model.MensajeChat;
import com.siscoca.repository.MensajeChatRepository;
import com.siscoca.repository.CampanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {
    
    @Autowired
    private MensajeChatRepository mensajeRepository;
    
    @Autowired
    private CampanaRepository campanaRepository;
    
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
        mensajeRepository.save(mensaje);
    }
    
    /**
     * Marca todos los mensajes de una campaña como leídos
     */
    public void marcarTodosComoLeidos(Long campanaId, String username) {
        List<MensajeChat> mensajes = mensajeRepository.findByCampanaIdOrderByFechaCreacionAsc(campanaId);
        
        for (MensajeChat mensaje : mensajes) {
            // Solo marcar como leído si no es el remitente
            if (!mensaje.getRemitente().equals(username) && !mensaje.getLeido()) {
                mensaje.setLeido(true);
                mensajeRepository.save(mensaje);
            }
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
}

