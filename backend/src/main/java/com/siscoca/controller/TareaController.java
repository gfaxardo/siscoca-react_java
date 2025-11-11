package com.siscoca.controller;

import com.siscoca.dto.TareaPendienteDto;
import com.siscoca.model.Rol;
import com.siscoca.service.TareaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tareas")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class TareaController {
    
    @Autowired
    private TareaService tareaService;
    
    /**
     * Obtiene todas las tareas pendientes del usuario autenticado
     */
    @GetMapping("/pendientes")
    public ResponseEntity<List<TareaPendienteDto>> getTareasPendientes(@RequestParam(required = false) String username) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usernameActual = username != null ? username : authentication.getName();
        
        // Obtener el rol del usuario autenticado
        Rol rol = obtenerRolDesdeAutenticacion(authentication);
        
        List<TareaPendienteDto> tareas = tareaService.getTareasPendientesPorUsuario(usernameActual, rol);
        return ResponseEntity.ok(tareas);
    }
    
    /**
     * Obtiene todas las tareas pendientes (requiere rol ADMIN)
     */
    @GetMapping("/todas")
    public ResponseEntity<List<TareaPendienteDto>> getAllTareasPendientes() {
        List<TareaPendienteDto> tareas = tareaService.getAllTareasPendientes();
        return ResponseEntity.ok(tareas);
    }
    
    /**
     * Obtiene las tareas de una campaña específica
     */
    @GetMapping("/campana/{campanaId}")
    public ResponseEntity<List<TareaPendienteDto>> getTareasPorCampana(@PathVariable Long campanaId) {
        List<TareaPendienteDto> tareas = tareaService.getTareasPorCampana(campanaId);
        return ResponseEntity.ok(tareas);
    }
    
    /**
     * Obtiene las tareas completadas (historial) de una campaña específica
     */
    @GetMapping("/campana/{campanaId}/completadas")
    public ResponseEntity<List<TareaPendienteDto>> getTareasCompletadasPorCampana(@PathVariable Long campanaId) {
        List<TareaPendienteDto> tareas = tareaService.getTareasCompletadasPorCampana(campanaId);
        return ResponseEntity.ok(tareas);
    }
    
    /**
     * Marca una tarea como completada
     */
    @PutMapping("/{tareaId}/completar")
    public ResponseEntity<String> completarTarea(@PathVariable Long tareaId) {
        tareaService.completarTarea(tareaId);
        return ResponseEntity.ok("Tarea marcada como completada");
    }
    
    /**
     * Genera automáticamente tareas pendientes para todas las campañas
     */
    @PostMapping("/generar")
    public ResponseEntity<String> generarTareasPendientes() {
        tareaService.generarTareasPendientes();
        return ResponseEntity.ok("Tareas pendientes generadas correctamente");
    }
    
    /**
     * Deriva una tarea a otro usuario
     */
    @PutMapping("/{tareaId}/derivar")
    public ResponseEntity<String> derivarTarea(
            @PathVariable Long tareaId,
            @RequestParam String nuevoAsignadoA) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String usuarioQueDeriva = authentication.getName();
            tareaService.derivarTarea(tareaId, nuevoAsignadoA, usuarioQueDeriva);
            return ResponseEntity.ok("Tarea derivada correctamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error derivando tarea: " + e.getMessage());
        }
    }
    
    /**
     * Obtiene el rol del usuario desde la autenticación
     */
    private Rol obtenerRolDesdeAutenticacion(Authentication authentication) {
        for (GrantedAuthority authority : authentication.getAuthorities()) {
            String authorityName = authority.getAuthority();
            if (authorityName.startsWith("ROLE_")) {
                String rolName = authorityName.substring(5); // Quitar "ROLE_"
                try {
                    return Rol.valueOf(rolName);
                } catch (IllegalArgumentException e) {
                    // Si no se encuentra el rol, devolver TRAFFICKER por defecto
                    return Rol.TRAFFICKER;
                }
            }
        }
        return Rol.TRAFFICKER;
    }
}





