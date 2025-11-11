package com.siscoca.controller;

import com.siscoca.dto.LogRequest;
import com.siscoca.model.LogEntry;
import com.siscoca.service.AuditLogger;
import com.siscoca.service.LoggingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/logging")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class LoggingController {
    
    @Autowired
    private LoggingService loggingService;
    
    @Autowired
    private AuditLogger auditLogger;
    
    @PostMapping
    public ResponseEntity<Void> crearLog(@Valid @RequestBody LogRequest request) {
        auditLogger.logManual(
                request.getUsuario(),
                request.getRol(),
                request.getEntidad(),
                request.getAccion(),
                request.getEntidadId(),
                request.getDescripcion(),
                request.getDetalles()
        );
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    
    @GetMapping
    public ResponseEntity<List<LogEntry>> obtenerLogs(
            @RequestParam(required = false) String usuario,
            @RequestParam(required = false) String rol,
            @RequestParam(required = false) String accion,
            @RequestParam(required = false) String entidad,
            @RequestParam(required = false) String entidadId,
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta
    ) {
        List<LogEntry> logs = loggingService.obtenerLogs(usuario, rol, accion, entidad, entidadId, fechaDesde, fechaHasta);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/entidad/{entidadId}")
    public ResponseEntity<List<LogEntry>> obtenerLogsPorEntidad(@PathVariable String entidadId) {
        List<LogEntry> logs = loggingService.obtenerLogsPorEntidad(entidadId);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/usuario/{usuario}")
    public ResponseEntity<List<LogEntry>> obtenerLogsPorUsuario(@PathVariable String usuario) {
        List<LogEntry> logs = loggingService.obtenerLogsPorUsuario(usuario);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/recientes")
    public ResponseEntity<List<LogEntry>> obtenerLogsRecientes(@RequestParam(defaultValue = "50") int limite) {
        List<LogEntry> logs = loggingService.obtenerLogsRecientes(limite);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        Map<String, Object> stats = loggingService.obtenerEstadisticas();
        return ResponseEntity.ok(stats);
    }
    
    @DeleteMapping
    public ResponseEntity<Void> limpiarLogs() {
        loggingService.limpiarLogs();
        return ResponseEntity.noContent().build();
    }
}
