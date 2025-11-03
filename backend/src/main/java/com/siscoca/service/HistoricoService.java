package com.siscoca.service;

import com.siscoca.model.HistoricoSemanal;
import com.siscoca.repository.HistoricoSemanalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Optional;

@Service
public class HistoricoService {
    
    @Autowired
    private HistoricoSemanalRepository historicoRepository;
    
    public List<HistoricoSemanal> obtenerTodoElHistorico() {
        // Usar JOIN FETCH para cargar la relación campana y evitar lazy loading issues
        return historicoRepository.findAllWithCampana();
    }
    
    public List<HistoricoSemanal> obtenerHistoricoPorCampana(Long campanaId) {
        // Usar JOIN FETCH para cargar la relación campana
        return historicoRepository.findByCampanaIdOrderBySemanaISODesc(campanaId);
    }
    
    public List<HistoricoSemanal> obtenerHistoricoPorSemana(Integer semanaISO) {
        return historicoRepository.findBySemanaISO(semanaISO);
    }
    
    /**
     * Obtiene la semana ISO anterior (semana actual - 1)
     * Si estamos en la semana 1, retorna la última semana del año anterior
     */
    private int getPreviousWeekISO() {
        WeekFields weekFields = WeekFields.ISO;
        LocalDateTime ahora = LocalDateTime.now();
        int semanaActual = ahora.get(weekFields.weekOfWeekBasedYear());
        int añoActual = ahora.getYear();
        
        // Si estamos en la semana 1, retornar la última semana del año anterior
        if (semanaActual == 1) {
            // Calcular cuántas semanas tiene el año anterior
            LocalDateTime ultimoDiaAñoAnterior = LocalDateTime.of(añoActual - 1, 12, 31, 23, 59);
            return ultimoDiaAñoAnterior.get(weekFields.weekOfWeekBasedYear());
        }
        
        return semanaActual - 1;
    }
    
    public HistoricoSemanal crearRegistroHistorico(HistoricoSemanal historico) {
        // Si no se especifica semanaISO, usar la semana anterior por defecto
        if (historico.getSemanaISO() == null) {
            historico.setSemanaISO(getPreviousWeekISO());
        }
        
        // Establecer fechaSemana si no está establecida
        if (historico.getFechaSemana() == null) {
            historico.setFechaSemana(LocalDateTime.now());
        }
        
        return historicoRepository.save(historico);
    }
    
    public HistoricoSemanal actualizarRegistroHistorico(Long id, HistoricoSemanal historico) {
        return historicoRepository.findById(id)
                .map(existing -> {
                    // Actualizar la campaña si es necesario
                    if (historico.getCampana() != null) {
                        existing.setCampana(historico.getCampana());
                    }
                    existing.setSemanaISO(historico.getSemanaISO());
                    existing.setAlcance(historico.getAlcance());
                    existing.setClics(historico.getClics());
                    existing.setLeads(historico.getLeads());
                    existing.setCostoSemanal(historico.getCostoSemanal());
                    existing.setCostoLead(historico.getCostoLead());
                    existing.setConductoresRegistrados(historico.getConductoresRegistrados());
                    existing.setConductoresPrimerViaje(historico.getConductoresPrimerViaje());
                    existing.setCostoConductorRegistrado(historico.getCostoConductorRegistrado());
                    existing.setCostoConductorPrimerViaje(historico.getCostoConductorPrimerViaje());
                    return historicoRepository.save(existing);
                })
                .orElse(null);
    }
    
    public HistoricoSemanal actualizarSemanaISO(Long id, Integer nuevaSemanaISO) {
        return historicoRepository.findById(id)
                .map(existing -> {
                    existing.setSemanaISO(nuevaSemanaISO);
                    return historicoRepository.save(existing);
                })
                .orElse(null);
    }
    
    public boolean eliminarRegistroHistorico(Long id) {
        if (historicoRepository.existsById(id)) {
            historicoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
