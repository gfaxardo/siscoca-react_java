package com.siscoca.controller;

import com.siscoca.dto.MetricasGlobalesDto;
import com.siscoca.service.MetricasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/metricas")
@CrossOrigin(origins = "*")
public class MetricasController {
    
    @Autowired
    private MetricasService metricasService;
    
    @GetMapping("/campana/{id}")
    public ResponseEntity<MetricasGlobalesDto> getMetricasGlobales(@PathVariable Long id) {
        MetricasGlobalesDto metricas = metricasService.calcularMetricasGlobales(id);
        if (metricas != null) {
            return ResponseEntity.ok(metricas);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
