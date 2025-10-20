package com.siscoca.controller;

import com.siscoca.dto.CampanaDto;
import com.siscoca.service.CampanaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/campanas")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
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
    
    @PutMapping("/{id}")
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
}
