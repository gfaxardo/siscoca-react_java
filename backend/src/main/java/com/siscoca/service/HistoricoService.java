package com.siscoca.service;

import com.siscoca.model.HistoricoSemanal;
import com.siscoca.repository.HistoricoSemanalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HistoricoService {
    
    @Autowired
    private HistoricoSemanalRepository historicoRepository;
    
    public List<HistoricoSemanal> obtenerHistoricoPorCampana(Long campanaId) {
        return historicoRepository.findByCampana_Id(campanaId);
    }
    
    public List<HistoricoSemanal> obtenerHistoricoPorSemana(Integer semanaISO) {
        return historicoRepository.findBySemanaISO(semanaISO);
    }
    
    public HistoricoSemanal crearRegistroHistorico(HistoricoSemanal historico) {
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
    
    public boolean eliminarRegistroHistorico(Long id) {
        if (historicoRepository.existsById(id)) {
            historicoRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
