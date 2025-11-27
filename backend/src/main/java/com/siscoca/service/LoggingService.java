package com.siscoca.service;

import com.siscoca.model.LogEntry;
import com.siscoca.repository.LogEntryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LoggingService {
    
    @Autowired
    private LogEntryRepository logEntryRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public List<LogEntry> obtenerLogs(String usuario, String rol, String accion, String entidad,
                                     String entidadId, String fechaDesde, String fechaHasta) {
        LocalDateTime desde = parseDateTime(fechaDesde, false);
        LocalDateTime hasta = parseDateTime(fechaHasta, true);

        if (desde != null && hasta != null && hasta.isBefore(desde)) {
            LocalDateTime temp = desde;
            desde = hasta;
            hasta = temp;
        }

        String usuarioNorm = normalize(usuario);
        String rolNorm = normalize(rol);
        String accionNorm = normalize(accion);
        String entidadNorm = normalize(entidad);
        String entidadIdNorm = normalize(entidadId);

        // Construir consulta SQL dinámicamente
        StringBuilder sql = new StringBuilder("SELECT * FROM log_entries WHERE 1=1");
        List<Object> params = new ArrayList<>();

        if (usuarioNorm != null) {
            sql.append(" AND CAST(usuario AS TEXT) ILIKE ?");
            params.add("%" + usuarioNorm + "%");
        }

        if (rolNorm != null) {
            sql.append(" AND UPPER(CAST(rol AS TEXT)) = UPPER(?)");
            params.add(rolNorm);
        }

        if (accionNorm != null) {
            sql.append(" AND CAST(accion AS TEXT) ILIKE ?");
            params.add("%" + accionNorm + "%");
        }

        if (entidadNorm != null) {
            sql.append(" AND UPPER(CAST(entidad AS TEXT)) = UPPER(?)");
            params.add(entidadNorm);
        }

        if (entidadIdNorm != null) {
            sql.append(" AND CAST(entidad_id AS TEXT) = ?");
            params.add(entidadIdNorm);
        }

        if (desde != null) {
            sql.append(" AND timestamp >= ?");
            params.add(desde);
        }

        if (hasta != null) {
            sql.append(" AND timestamp <= ?");
            params.add(hasta);
        }

        sql.append(" ORDER BY timestamp DESC");

        Query query = entityManager.createNativeQuery(sql.toString(), LogEntry.class);
        for (int i = 0; i < params.size(); i++) {
            query.setParameter(i + 1, params.get(i));
        }

        @SuppressWarnings("unchecked")
        List<LogEntry> results = query.getResultList();
        return results;
    }
    
    public List<LogEntry> obtenerLogsPorEntidad(String entidadId) {
        return logEntryRepository.findByEntidadId(entidadId);
    }
    
    public List<LogEntry> obtenerLogsPorUsuario(String usuario) {
        return logEntryRepository.findByUsuario(usuario);
    }
    
    public List<LogEntry> obtenerLogsRecientes(int limite) {
        int size = Math.max(limite, 1);
        Pageable pageable = PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        return logEntryRepository.findAll(pageable).getContent();
    }
    
    public Map<String, Object> obtenerEstadisticas() {
        long totalLogs = logEntryRepository.count();
        
        Map<String, Long> logsPorUsuario = toCountMap(logEntryRepository.countLogsByUsuario());
        Map<String, Long> logsPorAccion = toCountMap(logEntryRepository.countLogsByAccion());
        Map<String, Long> logsPorEntidad = toCountMap(logEntryRepository.countLogsByEntidad());
        
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
        crearLog(usuario, rol, accion, entidad, entidadId, descripcion, detalles, null, null, null);
    }

    public void crearLog(String usuario, String rol, String accion, String entidad,
                        String entidadId, String descripcion, String detalles,
                        String ipAddress, String userAgent, String sessionId) {
        LogEntry logEntry = new LogEntry();
        logEntry.setUsuario(usuario);
        logEntry.setRol(rol);
        logEntry.setUsuarioId(resolveUsuarioId(usuario));
        logEntry.setAccion(accion);
        logEntry.setEntidad(entidad);
        logEntry.setEntidadId(entidadId);
        logEntry.setDescripcion(descripcion);
        logEntry.setDetalles(detalles);
        logEntry.setIpAddress(ipAddress);
        logEntry.setUserAgent(userAgent);
        logEntry.setSessionId(sessionId);
        LocalDateTime now = LocalDateTime.now();
        logEntry.setTimestamp(now);
        logEntry.setFechaCreacion(now);
        
        logEntryRepository.save(logEntry);
    }

    private Map<String, Long> toCountMap(List<Object[]> values) {
        Map<String, Long> result = new HashMap<>();
        if (values == null) {
            return result;
        }
        for (Object[] row : values) {
            if (row == null || row.length < 2 || row[0] == null || row[1] == null) {
                continue;
            }
            String key = String.valueOf(row[0]);
            long count = ((Number) row[1]).longValue();
            result.put(key, count);
        }
        return result;
    }

    private String resolveUsuarioId(String usuario) {
        if (usuario == null || usuario.isBlank()) {
            return "Sistema";
        }
        return usuario.trim();
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private LocalDateTime parseDateTime(String value, boolean endOfDay) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        String trimmed = value.trim();

        try {
            return LocalDateTime.parse(trimmed);
        } catch (DateTimeParseException ignored) {
        }

        try {
            OffsetDateTime offsetDateTime = OffsetDateTime.parse(trimmed);
            return offsetDateTime.toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        try {
            LocalDate date = LocalDate.parse(trimmed, DateTimeFormatter.ISO_DATE);
            if (endOfDay) {
                return date.atTime(23, 59, 59);
            }
            return date.atStartOfDay();
        } catch (DateTimeParseException ignored) {
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        try {
            return LocalDateTime.parse(trimmed, formatter);
        } catch (DateTimeParseException ignored) {
        }

        return null;
    }
}
