package com.siscoca.controller;

import com.siscoca.dto.CampanaDto;
import com.siscoca.service.CampanaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/campanas")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class CampanaController {
    
    @Autowired
    private CampanaService campanaService;
    
    @GetMapping
    public ResponseEntity<List<CampanaDto>> getAllCampanas() {
        List<CampanaDto> campanas = campanaService.getAllCampanas();
        return ResponseEntity.ok(campanas);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CampanaDto> getCampanaById(@PathVariable Long id) {
        CampanaDto campana = campanaService.getCampanaById(id);
        if (campana != null) {
            return ResponseEntity.ok(campana);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<CampanaDto> createCampana(@RequestBody CampanaDto campanaDto) {
        CampanaDto createdCampana = campanaService.createCampana(campanaDto);
        return ResponseEntity.ok(createdCampana);
    }
    
    @GetMapping("/semana-anterior")
    public ResponseEntity<Integer> getSemanaAnterior() {
        int semanaAnterior = campanaService.getPreviousWeekISO();
        return ResponseEntity.ok(semanaAnterior);
    }
    
    @PutMapping("/update/{id}")
    public ResponseEntity<CampanaDto> updateCampana(@PathVariable Long id, @RequestBody CampanaDto campanaDto) {
        CampanaDto updatedCampana = campanaService.updateCampana(id, campanaDto);
        if (updatedCampana != null) {
            return ResponseEntity.ok(updatedCampana);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampana(@PathVariable Long id) {
        boolean deleted = campanaService.deleteCampana(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/{id}/archivar")
    public ResponseEntity<?> archivarCampana(@PathVariable Long id) {
        try {
            CampanaDto campanaArchivada = campanaService.archivarCampana(id);
            if (campanaArchivada != null) {
                return ResponseEntity.ok(campanaArchivada);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error archivando campaña: " + e.getMessage());
        }
    }
    
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<CampanaDto>> getCampanasByEstado(@PathVariable String estado) {
        List<CampanaDto> campanas = campanaService.getCampanasByEstado(estado);
        return ResponseEntity.ok(campanas);
    }
    
    @GetMapping("/dueno/{nombreDueno}")
    public ResponseEntity<List<CampanaDto>> getCampanasByDueno(@PathVariable String nombreDueno) {
        List<CampanaDto> campanas = campanaService.getCampanasByDueno(nombreDueno);
        return ResponseEntity.ok(campanas);
    }
    
    @PostMapping("/{id}/reactivar")
    public ResponseEntity<?> reactivarCampana(@PathVariable Long id) {
        try {
            CampanaDto campanaReactivada = campanaService.reactivarCampana(id);
            if (campanaReactivada != null) {
                return ResponseEntity.ok(campanaReactivada);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error reactivando campaña: " + e.getMessage());
        }
    }
}
