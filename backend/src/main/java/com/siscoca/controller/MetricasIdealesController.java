package com.siscoca.controller;

import com.siscoca.dto.MetricaIdealDto;
import com.siscoca.service.MetricasIdealesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/metricas-ideales")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class MetricasIdealesController {
    
    @Autowired
    private MetricasIdealesService metricasIdealesService;
    
    @GetMapping
    public ResponseEntity<List<MetricaIdealDto>> listarMetricas(
            @RequestParam(required = false) String vertical,
            @RequestParam(required = false) String pais,
            @RequestParam(required = false) String plataforma,
            @RequestParam(required = false) String segmento,
            @RequestParam(required = false) Boolean activa
    ) {
        List<MetricaIdealDto> metricas = metricasIdealesService.listarMetricas(
                Optional.ofNullable(vertical),
                Optional.ofNullable(pais),
                Optional.ofNullable(plataforma),
                Optional.ofNullable(segmento),
                Optional.ofNullable(activa)
        );
        return ResponseEntity.ok(metricas);
    }
    
    @PostMapping
    public ResponseEntity<MetricaIdealDto> crearMetrica(@RequestBody MetricaIdealDto dto) {
        MetricaIdealDto creada = metricasIdealesService.crearMetrica(dto);
        return ResponseEntity.ok(creada);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MetricaIdealDto> actualizarMetrica(@PathVariable Long id, @RequestBody MetricaIdealDto dto) {
        MetricaIdealDto actualizada = metricasIdealesService.actualizarMetrica(id, dto);
        return ResponseEntity.ok(actualizada);
    }
    
    @PutMapping("/bulk")
    public ResponseEntity<List<MetricaIdealDto>> guardarMetricas(@RequestBody List<MetricaIdealDto> metricas) {
        List<MetricaIdealDto> resultado = metricasIdealesService.guardarMetricas(metricas);
        return ResponseEntity.ok(resultado);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMetrica(@PathVariable Long id) {
        metricasIdealesService.eliminarMetrica(id);
        return ResponseEntity.noContent().build();
    }
}

