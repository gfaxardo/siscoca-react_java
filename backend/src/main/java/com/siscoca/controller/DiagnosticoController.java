package com.siscoca.controller;

import com.siscoca.service.CampanaService;
import com.siscoca.service.HistoricoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/diagnostico")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://siscoca.yego.pro", "https://apisiscoca.yego.pro"})
public class DiagnosticoController {
    
    @Autowired
    private CampanaService campanaService;
    
    @Autowired
    private HistoricoService historicoService;
    
    /**
     * Endpoint para diagnosticar rendimiento de queries
     */
    @GetMapping("/rendimiento")
    public ResponseEntity<Map<String, Object>> diagnosticarRendimiento() {
        Map<String, Object> resultado = new HashMap<>();
        
        // Medir tiempo de obtener campañas
        long inicioCampanas = System.currentTimeMillis();
        int totalCampanas = campanaService.getAllCampanas().size();
        long tiempoCampanas = System.currentTimeMillis() - inicioCampanas;
        
        // Medir tiempo de obtener histórico
        long inicioHistorico = System.currentTimeMillis();
        int totalHistorico = historicoService.obtenerTodoElHistorico().size();
        long tiempoHistorico = System.currentTimeMillis() - inicioHistorico;
        
        resultado.put("campanasCount", totalCampanas);
        resultado.put("campanasTimeMs", tiempoCampanas);
        resultado.put("historicoCount", totalHistorico);
        resultado.put("historicoTimeMs", tiempoHistorico);
        resultado.put("totalTimeMs", tiempoCampanas + tiempoHistorico);
        
        // Advertencias
        if (tiempoCampanas > 500) {
            resultado.put("warning", "Query de campañas lenta (>" + tiempoCampanas + "ms)");
        }
        if (tiempoHistorico > 500) {
            resultado.put("warning", "Query de histórico lenta (>" + tiempoHistorico + "ms)");
        }
        
        return ResponseEntity.ok(resultado);
    }
}

