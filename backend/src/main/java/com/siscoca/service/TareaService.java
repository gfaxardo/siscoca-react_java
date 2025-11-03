package com.siscoca.service;

import com.siscoca.dto.TareaPendienteDto;
import com.siscoca.model.*;
import com.siscoca.repository.TareaPendienteRepository;
import com.siscoca.repository.CampanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TareaService {
    
    @Autowired
    private TareaPendienteRepository tareaRepository;
    
    @Autowired
    private CampanaRepository campanaRepository;
    
    /**
     * Genera automáticamente tareas pendientes basadas en el estado de las campañas
     */
    public void generarTareasPendientes() {
        List<Campana> campanas = campanaRepository.findAll();
        
        for (Campana campana : campanas) {
            // No generar tareas para campañas archivadas
            if (campana.getEstado() == EstadoCampana.ARCHIVADA) {
                continue;
            }
            
            // Determinar qué tarea debe existir según el estado
            TipoTarea tareaEsperada = obtenerTareaPorEstado(campana.getEstado());
            
            if (tareaEsperada != null) {
                // Verificar si ya existe esta tarea pendiente
                TareaPendiente tareaExistente = tareaRepository
                    .findByCampanaIdAndTipoTareaAndCompletadaFalse(campana.getId(), tareaEsperada)
                    .orElse(null);
                
                if (tareaExistente == null) {
                    crearTareaPendiente(campana, tareaEsperada);
                }
            }
        }
    }
    
    /**
     * Obtiene el tipo de tarea que corresponde a un estado de campaña
     */
    private TipoTarea obtenerTareaPorEstado(EstadoCampana estado) {
        switch (estado) {
            case PENDIENTE:
                return TipoTarea.ENVIAR_CREATIVO;
            case CREATIVO_ENVIADO:
                return TipoTarea.ACTIVAR_CAMPANA;
            case ACTIVA:
                // Para campañas activas, verificamos qué métricas faltan
                return null; // Se maneja en verificarTareasActivas()
            default:
                return null;
        }
    }
    
    /**
     * Verifica y crea tareas para campañas activas
     */
    public void verificarTareasActivas(Campana campana) {
        // Verificar métricas del trafficker
        boolean tieneMetricasTrafficker = campana.getAlcance() != null && 
                                         campana.getClics() != null && 
                                         campana.getLeads() != null && 
                                         campana.getCostoSemanal() != null;
        
        if (!tieneMetricasTrafficker) {
            TareaPendiente tareaTrafficker = tareaRepository
                .findByCampanaIdAndTipoTareaAndCompletadaFalse(campana.getId(), TipoTarea.SUBIR_METRICAS_TRAFFICKER)
                .orElse(null);
            
            if (tareaTrafficker == null) {
                crearTareaPendiente(campana, TipoTarea.SUBIR_METRICAS_TRAFFICKER);
            }
        }
        
        // Verificar métricas del dueño
        boolean tieneMetricasDueno = campana.getConductoresRegistrados() != null && 
                                    campana.getConductoresPrimerViaje() != null;
        
        if (!tieneMetricasDueno) {
            TareaPendiente tareaDueno = tareaRepository
                .findByCampanaIdAndTipoTareaAndCompletadaFalse(campana.getId(), TipoTarea.SUBIR_METRICAS_DUENO)
                .orElse(null);
            
            if (tareaDueno == null) {
                crearTareaPendiente(campana, TipoTarea.SUBIR_METRICAS_DUENO);
            }
        }
        
        // Si tiene ambas métricas, crear tarea de archivar
        if (tieneMetricasTrafficker && tieneMetricasDueno) {
            TareaPendiente tareaArchivar = tareaRepository
                .findByCampanaIdAndTipoTareaAndCompletadaFalse(campana.getId(), TipoTarea.ARCHIVAR_CAMPANA)
                .orElse(null);
            
            if (tareaArchivar == null) {
                crearTareaPendiente(campana, TipoTarea.ARCHIVAR_CAMPANA);
            }
        }
    }
    
    /**
     * Crea una nueva tarea pendiente
     */
    private void crearTareaPendiente(Campana campana, TipoTarea tipoTarea) {
        TareaPendiente tarea = new TareaPendiente();
        tarea.setCampana(campana);
        tarea.setTipoTarea(tipoTarea);
        tarea.setResponsableRol(tipoTarea.getResponsable());
        
        // Asignar según el tipo de tarea
        String asignadoA = determinarAsignado(campana, tipoTarea);
        tarea.setAsignadoA(asignadoA);
        
        tarea.setDescripcion(generarDescripcionTarea(campana, tipoTarea));
        tarea.setCompletada(false);
        tarea.setUrgente(false);
        tarea.setFechaCreacion(LocalDateTime.now());
        
        tareaRepository.save(tarea);
    }
    
    /**
     * Determina a quién se asigna la tarea según el tipo
     */
    private String determinarAsignado(Campana campana, TipoTarea tipoTarea) {
        switch (tipoTarea) {
            case ENVIAR_CREATIVO:
            case ACTIVAR_CAMPANA:
                // Tareas de MKT: asignar a "Ariana de la Cruz"
                return "Ariana de la Cruz";
            case SUBIR_METRICAS_TRAFFICKER:
                // Tareas de trafficker: asignar a "Rayedel Ortega"
                return "Rayedel Ortega";
            case SUBIR_METRICAS_DUENO:
            case ARCHIVAR_CAMPANA:
                // Tareas del dueño: usar el dueño de la campaña
                return campana.getNombreDueno();
            default:
                return campana.getNombreDueno();
        }
    }
    
    /**
     * Genera la descripción automática de una tarea
     */
    private String generarDescripcionTarea(Campana campana, TipoTarea tipoTarea) {
        switch (tipoTarea) {
            case ENVIAR_CREATIVO:
                return String.format("Enviar el creativo para: %s", campana.getNombre());
            case ACTIVAR_CAMPANA:
                return String.format("Activar la campaña: %s - El creativo ya está disponible", campana.getNombre());
            case SUBIR_METRICAS_TRAFFICKER:
                return String.format("Subir métricas de trafficker para: %s (Alcance, Clics, Leads, Costo)", campana.getNombre());
            case SUBIR_METRICAS_DUENO:
                return String.format("Subir métricas de conductores para: %s (Registrados, Primer Viaje)", campana.getNombre());
            case ARCHIVAR_CAMPANA:
                return String.format("Archivar la campaña: %s - Las métricas están completas", campana.getNombre());
            case CREAR_CAMPANA:
                return String.format("Crear nueva campaña");
            default:
                return String.format("Tarea para la campaña: %s", campana.getNombre());
        }
    }
    
    /**
     * Obtiene todas las tareas pendientes para un usuario según su rol
     */
    public List<TareaPendienteDto> getTareasPendientesPorUsuario(String username, Rol rol) {
        List<TareaPendiente> tareas = tareaRepository.findTareasPendientesParaUsuario(rol, username);
        return tareas.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtiene todas las tareas pendientes
     */
    public List<TareaPendienteDto> getAllTareasPendientes() {
        return tareaRepository.findByCompletadaFalse().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Marca una tarea como completada
     */
    public void completarTarea(Long tareaId) {
        TareaPendiente tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        
        tarea.setCompletada(true);
        tareaRepository.save(tarea);
    }
    
    /**
     * Obtiene tareas pendientes de una campaña específica
     */
    public List<TareaPendienteDto> getTareasPorCampana(Long campanaId) {
        return tareaRepository.findByCampanaId(campanaId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Convierte TareaPendiente a DTO
     */
    private TareaPendienteDto convertToDto(TareaPendiente tarea) {
        TareaPendienteDto dto = new TareaPendienteDto();
        dto.setId(tarea.getId());
        dto.setTipoTarea(tarea.getTipoTarea().getDisplayName());
        dto.setCampanaId(tarea.getCampana().getId());
        dto.setCampanaNombre(tarea.getCampana().getNombre());
        dto.setAsignadoA(tarea.getAsignadoA());
        dto.setResponsableRol(tarea.getResponsableRol().getDisplayName());
        dto.setDescripcion(tarea.getDescripcion());
        dto.setUrgente(tarea.getUrgente());
        dto.setCompletada(tarea.getCompletada());
        dto.setFechaCreacion(tarea.getFechaCreacion());
        dto.setFechaCompletada(tarea.getFechaCompletada());
        return dto;
    }
}

