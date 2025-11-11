package com.siscoca.service;

import com.siscoca.model.Campana;
import com.siscoca.model.EstadoCampana;
import com.siscoca.model.TipoTarea;
import com.siscoca.model.TareaPendiente;
import com.siscoca.model.Rol;
import com.siscoca.repository.CampanaRepository;
import com.siscoca.repository.TareaPendienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TareaSemanalService {
    
    @Autowired
    private CampanaRepository campanaRepository;
    
    @Autowired
    private TareaPendienteRepository tareaRepository;
    
    /**
     * Se ejecuta todos los lunes a las 9:00 AM (hora local)
     * Crea tareas de métricas para todas las campañas activas de la semana anterior
     */
    @Scheduled(cron = "0 0 9 * * MON") // Todos los lunes a las 9:00 AM
    @Transactional
    public void generarTareasMetricasSemanaAnterior() {
        System.out.println("Iniciando generación de tareas semanales para la semana anterior: " + LocalDateTime.now());
        
        // Obtener todas las campañas activas
        List<Campana> campanasActivas = campanaRepository.findByEstado(EstadoCampana.ACTIVA);
        
        System.out.println("Campañas activas encontradas: " + campanasActivas.size());
        
        for (Campana campana : campanasActivas) {
            // Crear tarea de métricas para trafficker
            crearTareaMetricasSemanaAnterior(campana, TipoTarea.SUBIR_METRICAS_TRAFFICKER, "Rayedel Ortega");
            
            // Crear tarea de métricas para dueño (usando el nombreDueno de la campaña)
            crearTareaMetricasSemanaAnterior(campana, TipoTarea.SUBIR_METRICAS_DUENO, campana.getNombreDueno());
        }
        
        System.out.println("Generación de tareas semanales completada: " + LocalDateTime.now());
    }
    
    /**
     * Crea una tarea de métricas para la semana anterior si no existe ya
     */
    private void crearTareaMetricasSemanaAnterior(Campana campana, TipoTarea tipoTarea, String asignadoA) {
        // Verificar si ya existe esta tarea pendiente para esta campaña y tipo
        TareaPendiente tareaExistente = tareaRepository
            .findByCampanaIdAndTipoTareaAndCompletadaFalse(campana.getId(), tipoTarea)
            .orElse(null);
        
        if (tareaExistente == null) {
            TareaPendiente tarea = new TareaPendiente();
            tarea.setCampana(campana);
            tarea.setTipoTarea(tipoTarea);
            tarea.setResponsableRol(tipoTarea.getResponsable());
            tarea.setAsignadoA(asignadoA);
            
            // Generar descripción específica para tareas semanales
            String descripcion = generarDescripcionTareaSemanal(campana, tipoTarea);
            tarea.setDescripcion(descripcion);
            
            tarea.setCompletada(false);
            tarea.setUrgente(false);
            tarea.setFechaCreacion(LocalDateTime.now());
            
            tareaRepository.save(tarea);
            System.out.println("Tarea creada: " + tipoTarea.getDisplayName() + " para campaña: " + campana.getNombre());
        } else {
            System.out.println("Tarea ya existe: " + tipoTarea.getDisplayName() + " para campaña: " + campana.getNombre());
        }
    }
    
    /**
     * Genera la descripción para tareas semanales de métricas
     */
    private String generarDescripcionTareaSemanal(Campana campana, TipoTarea tipoTarea) {
        // Obtener la semana anterior (la que terminó el domingo)
        int semanaAnterior = obtenerSemanaAnterior();
        
        switch (tipoTarea) {
            case SUBIR_METRICAS_TRAFFICKER:
                return String.format("Subir métricas de trafficker para: %s - Semana %d (semana anterior terminada el domingo)", 
                    campana.getNombre(), semanaAnterior);
            case SUBIR_METRICAS_DUENO:
                return String.format("Subir métricas de conductores para: %s - Semana %d (semana anterior terminada el domingo)", 
                    campana.getNombre(), semanaAnterior);
            default:
                return String.format("Tarea para la campaña: %s - Semana %d", campana.getNombre(), semanaAnterior);
        }
    }
    
    /**
     * Obtiene la semana ISO anterior (semana actual - 1)
     */
    private int obtenerSemanaAnterior() {
        java.time.temporal.WeekFields weekFields = java.time.temporal.WeekFields.ISO;
        LocalDateTime ahora = LocalDateTime.now();
        int semanaActual = ahora.get(weekFields.weekOfWeekBasedYear());
        int añoActual = ahora.getYear();
        
        // Si estamos en la semana 1, retornar la última semana del año anterior
        if (semanaActual == 1) {
            LocalDateTime ultimoDiaAñoAnterior = LocalDateTime.of(añoActual - 1, 12, 31, 23, 59);
            return ultimoDiaAñoAnterior.get(weekFields.weekOfWeekBasedYear());
        }
        
        return semanaActual - 1;
    }
}

