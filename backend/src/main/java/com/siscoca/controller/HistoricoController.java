package com.siscoca.controller;

import com.siscoca.model.HistoricoSemanal;
import com.siscoca.service.HistoricoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/historico")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:5173"})
public class HistoricoController {
    
    @Autowired
    private HistoricoService historicoService;
    
    @GetMapping
    public ResponseEntity<List<HistoricoSemanal>> obtenerTodoElHistorico() {
        List<HistoricoSemanal> historico = historicoService.obtenerTodoElHistorico();
        return ResponseEntity.ok(historico);
    }
    
    @GetMapping("/campana/{campanaId}")
    public ResponseEntity<List<HistoricoSemanal>> obtenerHistoricoPorCampana(@PathVariable Long campanaId) {
        List<HistoricoSemanal> historico = historicoService.obtenerHistoricoPorCampana(campanaId);
        return ResponseEntity.ok(historico);
    }
    
    @GetMapping("/semana/{semanaISO}")
    public ResponseEntity<List<HistoricoSemanal>> obtenerHistoricoPorSemana(@PathVariable Integer semanaISO) {
        List<HistoricoSemanal> historico = historicoService.obtenerHistoricoPorSemana(semanaISO);
        return ResponseEntity.ok(historico);
    }
    
    @PostMapping
    public ResponseEntity<HistoricoSemanal> crearRegistroHistorico(@RequestBody HistoricoSemanal historico) {
        HistoricoSemanal creado = historicoService.crearRegistroHistorico(historico);
        return ResponseEntity.ok(creado);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<HistoricoSemanal> actualizarRegistroHistorico(@PathVariable Long id, @RequestBody HistoricoSemanal historico) {
        HistoricoSemanal actualizado = historicoService.actualizarRegistroHistorico(id, historico);
        if (actualizado != null) {
            return ResponseEntity.ok(actualizado);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PatchMapping("/{id}/semana-iso")
    public ResponseEntity<HistoricoSemanal> actualizarSemanaISO(@PathVariable Long id, @RequestParam Integer nuevaSemanaISO) {
        HistoricoSemanal actualizado = historicoService.actualizarSemanaISO(id, nuevaSemanaISO);
        if (actualizado != null) {
            return ResponseEntity.ok(actualizado);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRegistroHistorico(@PathVariable Long id) {
        boolean eliminado = historicoService.eliminarRegistroHistorico(id);
        if (eliminado) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
