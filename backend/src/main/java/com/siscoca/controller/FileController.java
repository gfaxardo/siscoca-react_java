package com.siscoca.controller;

import com.siscoca.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/files")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class FileController {
    
    @Value("${file.upload-dir:./uploads/creativos}")
    private String uploadDir;
    
    @Autowired
    private MediaService mediaService;
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> subirArchivo(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Archivo vacío"));
            }
            
            // Crear directorio si no existe
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generar nombre único para el archivo
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = UUID.randomUUID().toString() + extension;
            
            // Guardar archivo
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            return ResponseEntity.ok(Map.of(
                "filename", filename,
                "originalName", originalFilename != null ? originalFilename : "",
                "size", String.valueOf(file.getSize()),
                "url", "/files/download/" + filename
            ));
            
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error subiendo archivo: " + e.getMessage()));
        }
    }
    
    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> descargarArchivo(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @DeleteMapping("/{filename}")
    public ResponseEntity<Map<String, String>> eliminarArchivo(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
            Files.deleteIfExists(filePath);
            
            return ResponseEntity.ok(Map.of("message", "Archivo eliminado correctamente"));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error eliminando archivo: " + e.getMessage()));
        }
    }
    
    /**
     * Endpoint para subir archivos al servidor de media externo
     * Este endpoint recibe el archivo del frontend y lo sube al servidor de media usando HTTP
     * (el backend puede hacer peticiones HTTP sin problemas de Mixed Content)
     */
    @PostMapping("/upload-to-media")
    public ResponseEntity<Map<String, String>> subirArchivoAMedia(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Archivo vacío"));
            }
            
            // Usar MediaService para subir al servidor de media externo
            String urlPublica = mediaService.subirArchivo(file);
            
            return ResponseEntity.ok(Map.of(
                "url", urlPublica,
                "originalName", file.getOriginalFilename() != null ? file.getOriginalFilename() : "",
                "size", String.valueOf(file.getSize())
            ));
            
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "Error subiendo archivo a media: " + e.getMessage()));
        }
    }
}
