package com.siscoca.controller;

import com.siscoca.model.Creativo;
import com.siscoca.service.CreativoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/creativos")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class CreativoController {
    
    private static final Logger logger = LoggerFactory.getLogger(CreativoController.class);
    
    @Autowired
    private CreativoService creativoService;
    
    @GetMapping("/campana/{campanaId}")
    public ResponseEntity<List<Creativo>> obtenerCreativosPorCampana(@PathVariable Long campanaId) {
        try {
            List<Creativo> creativos = creativoService.obtenerCreativosPorCampana(campanaId);
            return ResponseEntity.ok(creativos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/campana/{campanaId}/activos")
    public ResponseEntity<List<Creativo>> obtenerCreativosActivosPorCampana(@PathVariable Long campanaId) {
        try {
            List<Creativo> creativos = creativoService.obtenerCreativosActivosPorCampana(campanaId);
            return ResponseEntity.ok(creativos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/campana/{campanaId}/descartados")
    public ResponseEntity<List<Creativo>> obtenerCreativosDescartadosPorCampana(@PathVariable Long campanaId) {
        try {
            List<Creativo> creativos = creativoService.obtenerCreativosDescartadosPorCampana(campanaId);
            return ResponseEntity.ok(creativos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/campana/{campanaId}")
    public ResponseEntity<Creativo> crearCreativo(@PathVariable Long campanaId, @RequestBody Creativo creativo) {
        try {
            logger.debug("Creando creativo para campaña {}: urlExterna={}, activo={}", 
                campanaId, creativo.getUrlCreativoExterno() != null, creativo.getActivo());
            
            Creativo creado = creativoService.crearCreativo(campanaId, creativo);
            
            logger.info("Creativo {} creado exitosamente para campaña {}", creado.getId(), campanaId);
            return ResponseEntity.ok(creado);
        } catch (RuntimeException e) {
            logger.error("Error al crear creativo para campaña {}: {}", campanaId, e.getMessage(), e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Creativo> actualizarCreativo(@PathVariable Long id, @RequestBody Creativo creativo) {
        try {
            Creativo actualizado = creativoService.actualizarCreativo(id, creativo);
            return ResponseEntity.ok(actualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCreativo(@PathVariable Long id) {
        try {
            creativoService.eliminarCreativo(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Creativo> obtenerCreativoPorId(@PathVariable Long id) {
        try {
            return creativoService.obtenerCreativoPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/descartar")
    public ResponseEntity<Creativo> marcarComoDescartado(@PathVariable Long id) {
        try {
            creativoService.marcarComoDescartado(id);
            return creativoService.obtenerCreativoPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/activar")
    public ResponseEntity<Creativo> marcarComoActivo(@PathVariable Long id) {
        try {
            creativoService.marcarComoActivo(id);
            return creativoService.obtenerCreativoPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PatchMapping("/{id}/orden")
    public ResponseEntity<Creativo> actualizarOrden(@PathVariable Long id, @RequestParam Integer orden) {
        try {
            creativoService.actualizarOrden(id, orden);
            return creativoService.obtenerCreativoPorId(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/campana/{campanaId}/sincronizar-estado")
    public ResponseEntity<String> sincronizarEstadoCampana(@PathVariable Long campanaId) {
        try {
            creativoService.verificarYSincronizarEstadoCampana(campanaId);
            return ResponseEntity.ok("Estado de la campaña sincronizado correctamente");
        } catch (Exception e) {
            logger.error("Error sincronizando estado de campaña {}: {}", campanaId, e.getMessage(), e);
            return ResponseEntity.badRequest().body("Error al sincronizar estado: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}/descargar")
    public ResponseEntity<?> descargarCreativo(@PathVariable Long id) {
        try {
            return creativoService.obtenerCreativoPorId(id)
                    .map(creativo -> {
                        // Priorizar URL externa (ya que ahora las imágenes se guardan como URL)
                        if (creativo.getUrlCreativoExterno() != null && !creativo.getUrlCreativoExterno().isEmpty()) {
                            return ResponseEntity.status(302)
                                    .header("Location", creativo.getUrlCreativoExterno())
                                    .build();
                        }
                        // Si aún tiene archivo base64 (legacy), retornarlo como respuesta de descarga
                        else if (creativo.getArchivoCreativo() != null && !creativo.getArchivoCreativo().isEmpty()) {
                            String nombreArchivo = creativo.getNombreArchivoCreativo() != null 
                                    ? creativo.getNombreArchivoCreativo() 
                                    : "creativo_" + id;
                            
                            // Determinar content type basado en el archivo
                            String contentType = "application/octet-stream";
                            if (creativo.getArchivoCreativo().startsWith("data:")) {
                                int tipoEnd = creativo.getArchivoCreativo().indexOf(";");
                                if (tipoEnd > 0) {
                                    contentType = creativo.getArchivoCreativo().substring(5, tipoEnd);
                                }
                            }
                            
                            // Extraer base64 del data URL
                            String base64 = creativo.getArchivoCreativo();
                            if (base64.contains(",")) {
                                base64 = base64.substring(base64.indexOf(",") + 1);
                            }
                            
                            byte[] archivoBytes = java.util.Base64.getDecoder().decode(base64);
                            
                            return ResponseEntity.ok()
                                    .header("Content-Disposition", "attachment; filename=\"" + nombreArchivo + "\"")
                                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                                    .body(archivoBytes);
                        }
                        // Si no tiene archivo ni URL
                        else {
                            return ResponseEntity.notFound().build();
                        }
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

