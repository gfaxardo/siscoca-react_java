package com.siscoca.service;

import com.siscoca.dto.TareaPendienteDto;
import com.siscoca.model.AuditEntity;
import com.siscoca.model.*;
import com.siscoca.repository.TareaPendienteRepository;
import com.siscoca.repository.CampanaRepository;
import com.siscoca.repository.CreativoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TareaService {
    
    @Autowired
    private TareaPendienteRepository tareaRepository;
    
    @Autowired
    private CampanaRepository campanaRepository;
    
    @Autowired
    private CreativoRepository creativoRepository;
    
    @Autowired
    private AuditLogger auditLogger;
    
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
        
        TareaPendiente guardada = tareaRepository.save(tarea);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("campanaId", campana.getId());
        detalles.put("tipoTarea", tipoTarea.getDisplayName());
        detalles.put("asignadoA", guardada.getAsignadoA());
        auditLogger.log(
                AuditEntity.TAREAS,
                "Crear tarea",
                String.valueOf(guardada.getId()),
                "Tarea generada automáticamente",
                detalles
        );
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
        
        // El setter de setCompletada ya establece fechaCompletada automáticamente
        tarea.setCompletada(true);
        TareaPendiente guardada = tareaRepository.save(tarea);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("tarea", resumenTarea(guardada));
        auditLogger.log(
                AuditEntity.TAREAS,
                "Completar tarea",
                String.valueOf(tareaId),
                "Tarea marcada como completada",
                detalles
        );
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
     * Obtiene tareas completadas de una campaña específica (historial)
     */
    public List<TareaPendienteDto> getTareasCompletadasPorCampana(Long campanaId) {
        return tareaRepository.findByCampanaIdAndCompletadaTrue(campanaId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Deriva una tarea a otro usuario
     */
    @Transactional
    public void derivarTarea(Long tareaId, String nuevoAsignadoA, String usuarioQueDeriva) {
        TareaPendiente tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada"));
        
        String asignadoAnterior = tarea.getAsignadoA();
        tarea.setAsignadoA(nuevoAsignadoA);
        
        // Actualizar descripción para incluir información de derivación
        String descripcionOriginal = tarea.getDescripcion();
        String nuevaDescripcion = descripcionOriginal;
        if (!descripcionOriginal.contains("Derivada")) {
            nuevaDescripcion = descripcionOriginal + 
                    String.format(" [Derivada por %s desde %s]", usuarioQueDeriva, asignadoAnterior);
        } else {
            // Si ya fue derivada, actualizar información
            nuevaDescripcion = descripcionOriginal.replaceAll(
                    "\\[Derivada por .*\\]", 
                    String.format("[Derivada por %s desde %s]", usuarioQueDeriva, asignadoAnterior)
            );
        }
        tarea.setDescripcion(nuevaDescripcion);
        
        TareaPendiente guardada = tareaRepository.save(tarea);
        
        Map<String, Object> detalles = new LinkedHashMap<>();
        detalles.put("tarea", resumenTarea(guardada));
        detalles.put("asignadoAnterior", asignadoAnterior);
        detalles.put("nuevoAsignado", nuevoAsignadoA);
        detalles.put("derivadoPor", usuarioQueDeriva);
        auditLogger.logManual(
                usuarioQueDeriva,
                null,
                AuditEntity.TAREAS,
                "Derivar tarea",
                String.valueOf(tareaId),
                "Tarea derivada a otro responsable",
                detalles
        );
    }
    
    /**
     * Crea una tarea cuando se sube o modifica un creativo en campaña activa
     * El trafficker debe gestionar la subida/actualización del creativo en la plataforma
     */
    public void crearTareaParaNuevoCreativo(Campana campana) {
        // Verificar si ya existe una tarea pendiente de tipo ENVIAR_CREATIVO para esta campaña
        // Si existe, actualizarla. Si no, crear una nueva específica para gestionar creativos
        TareaPendiente tareaExistente = tareaRepository
            .findByCampanaIdAndTipoTareaAndCompletadaFalse(campana.getId(), TipoTarea.ENVIAR_CREATIVO)
            .orElse(null);
        
        if (tareaExistente == null) {
            // Crear nueva tarea específica para gestionar creativos en campaña activa
            // Usamos ENVIAR_CREATIVO pero asignada al TRAFFICKER para que gestione la subida
            TareaPendiente tarea = new TareaPendiente();
            tarea.setCampana(campana);
            tarea.setTipoTarea(TipoTarea.ENVIAR_CREATIVO);
            tarea.setResponsableRol(Rol.TRAFFICKER); // El trafficker gestiona la subida en la plataforma
            tarea.setAsignadoA("Rayedel Ortega");
            tarea.setDescripcion(String.format("Gestionar creativos para: %s - Se ha agregado o modificado un creativo activo. Debe subirse/actualizarse en la plataforma de publicidad", campana.getNombre()));
            tarea.setCompletada(false);
            tarea.setUrgente(false);
            tarea.setFechaCreacion(LocalDateTime.now());
            TareaPendiente guardada = tareaRepository.save(tarea);
            Map<String, Object> detalles = new LinkedHashMap<>();
            detalles.put("tarea", resumenTarea(guardada));
            detalles.put("motivo", "Nuevo creativo en campaña activa");
            auditLogger.log(
                    AuditEntity.TAREAS,
                    "Crear tarea",
                    String.valueOf(guardada.getId()),
                    "Tarea generada por nuevo creativo",
                    detalles
            );
        } else {
            // Actualizar descripción para mencionar que hay nuevos/modificados creativos
            String descripcion = tareaExistente.getDescripcion();
            if (!descripcion.contains("creativo activo") && !descripcion.contains("modificado")) {
                tareaExistente.setDescripcion(String.format("Gestionar creativos para: %s - Se ha agregado o modificado un creativo activo. Debe subirse/actualizarse en la plataforma de publicidad", campana.getNombre()));
                tareaExistente.setFechaCreacion(LocalDateTime.now()); // Actualizar fecha para que aparezca como reciente
                TareaPendiente guardada = tareaRepository.save(tareaExistente);
                Map<String, Object> detalles = new LinkedHashMap<>();
                detalles.put("tarea", resumenTarea(guardada));
                detalles.put("motivo", "Actualización de creativo");
                auditLogger.log(
                        AuditEntity.TAREAS,
                        "Actualizar tarea",
                        String.valueOf(guardada.getId()),
                        "Tarea actualizada por modificación de creativo",
                        detalles
                );
            }
        }
    }
    
    /**
     * Crea una tarea cuando se descarta un creativo en campaña activa
     */
    public void crearTareaParaDescartarCreativo(Campana campana) {
        // Verificar si hay creativos activos restantes usando el repositorio
        long activosCount = creativoRepository.countByCampana_IdAndActivoTrue(campana.getId());
        
        // Si no quedan creativos activos, crear tarea para MKT
        if (activosCount == 0) {
            TareaPendiente tareaExistente = tareaRepository
                .findByCampanaIdAndTipoTareaAndCompletadaFalse(campana.getId(), TipoTarea.ENVIAR_CREATIVO)
                .orElse(null);
            
            if (tareaExistente == null) {
                TareaPendiente tarea = new TareaPendiente();
                tarea.setCampana(campana);
                tarea.setTipoTarea(TipoTarea.ENVIAR_CREATIVO);
                tarea.setResponsableRol(Rol.MKT);
                tarea.setAsignadoA("Ariana de la Cruz");
                tarea.setDescripcion(String.format("Subir nuevos creativos para: %s - Todos los creativos fueron descartados", campana.getNombre()));
                tarea.setCompletada(false);
                tarea.setUrgente(true); // Urgente porque no hay creativos activos
                tarea.setFechaCreacion(LocalDateTime.now());
                TareaPendiente guardada = tareaRepository.save(tarea);
                Map<String, Object> detalles = new LinkedHashMap<>();
                detalles.put("tarea", resumenTarea(guardada));
                detalles.put("motivo", "Sin creativos activos");
                auditLogger.log(
                        AuditEntity.TAREAS,
                        "Crear tarea",
                        String.valueOf(guardada.getId()),
                        "Tarea generada por descarte total de creativos",
                        detalles
                );
            }
        } else {
            // Si aún hay creativos activos, crear tarea informativa para MKT
            TareaPendiente tarea = new TareaPendiente();
            tarea.setCampana(campana);
            tarea.setTipoTarea(TipoTarea.ENVIAR_CREATIVO);
            tarea.setResponsableRol(Rol.MKT);
            tarea.setAsignadoA("Ariana de la Cruz");
            tarea.setDescripcion(String.format("Revisar descarte de creativo para: %s - Se descartó un creativo, quedan %d activos", 
                    campana.getNombre(), activosCount));
            tarea.setCompletada(false);
            tarea.setUrgente(false);
            tarea.setFechaCreacion(LocalDateTime.now());
            TareaPendiente guardada = tareaRepository.save(tarea);
            Map<String, Object> detalles = new LinkedHashMap<>();
            detalles.put("tarea", resumenTarea(guardada));
            detalles.put("motivo", "Creativo descartado");
            auditLogger.log(
                    AuditEntity.TAREAS,
                    "Crear tarea",
                    String.valueOf(guardada.getId()),
                    "Tarea generada por descarte de creativo",
                    detalles
            );
        }
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
    
    private Map<String, Object> resumenTarea(TareaPendiente tarea) {
        Map<String, Object> data = new LinkedHashMap<>();
        if (tarea == null) {
            return data;
        }
        data.put("id", tarea.getId());
        data.put("campanaId", tarea.getCampana() != null ? tarea.getCampana().getId() : null);
        data.put("campanaNombre", tarea.getCampana() != null ? tarea.getCampana().getNombre() : null);
        data.put("tipoTarea", tarea.getTipoTarea() != null ? tarea.getTipoTarea().getDisplayName() : null);
        data.put("asignadoA", tarea.getAsignadoA());
        data.put("responsableRol", tarea.getResponsableRol() != null ? tarea.getResponsableRol().getDisplayName() : null);
        data.put("descripcion", tarea.getDescripcion());
        data.put("urgente", tarea.getUrgente());
        data.put("completada", tarea.getCompletada());
        data.put("fechaCreacion", tarea.getFechaCreacion());
        data.put("fechaCompletada", tarea.getFechaCompletada());
        return data;
    }
}

