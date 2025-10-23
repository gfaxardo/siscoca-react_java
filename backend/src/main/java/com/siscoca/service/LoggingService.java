package com.siscoca.service;

import com.siscoca.model.LogEntry;
import com.siscoca.repository.LogEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LoggingService {
    
    @Autowired
    private LogEntryRepository logEntryRepository;
    
    public List<LogEntry> obtenerLogs(String usuario, String rol, String accion, String entidad, 
                                     String entidadId, String fechaDesde, String fechaHasta) {
        return logEntryRepository.findByFilters(usuario, rol, accion, entidad, entidadId);
    }
    
    public List<LogEntry> obtenerLogsPorEntidad(String entidadId) {
        return logEntryRepository.findByEntidadId(entidadId);
    }
    
    public List<LogEntry> obtenerLogsPorUsuario(String usuario) {
        return logEntryRepository.findByUsuario(usuario);
    }
    
    public List<LogEntry> obtenerLogsRecientes(int limite) {
        return logEntryRepository.findTopNByOrderByTimestampDesc(limite);
    }
    
    public Map<String, Object> obtenerEstadisticas() {
        long totalLogs = logEntryRepository.count();
        
        Map<String, Long> logsPorUsuario = logEntryRepository.countByUsuario();
        Map<String, Long> logsPorAccion = logEntryRepository.countByAccion();
        Map<String, Long> logsPorEntidad = logEntryRepository.countByEntidad();
        
        List<LogEntry> actividadReciente = obtenerLogsRecientes(10);
        
        return Map.of(
            "totalLogs", totalLogs,
            "logsPorUsuario", logsPorUsuario,
            "logsPorAccion", logsPorAccion,
            "logsPorEntidad", logsPorEntidad,
            "actividadReciente", actividadReciente
        );
    }
    
    public void limpiarLogs() {
        logEntryRepository.deleteAll();
    }
    
    public void crearLog(String usuario, String rol, String accion, String entidad, 
                        String entidadId, String descripcion, String detalles) {
        LogEntry logEntry = new LogEntry();
        logEntry.setUsuario(usuario);
        logEntry.setRol(rol);
        logEntry.setAccion(accion);
        logEntry.setEntidad(entidad);
        logEntry.setEntidadId(entidadId);
        logEntry.setDescripcion(descripcion);
        logEntry.setDetalles(detalles);
        logEntry.setTimestamp(LocalDateTime.now());
        
        logEntryRepository.save(logEntry);
    }
}
