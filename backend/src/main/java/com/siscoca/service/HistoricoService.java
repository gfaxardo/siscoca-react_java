package com.siscoca.service;

import com.siscoca.dto.HistoricoImportDto;
import com.siscoca.dto.HistoricoImportResponseDto;
import com.siscoca.model.Campana;
import com.siscoca.model.HistoricoSemanal;
import com.siscoca.repository.CampanaRepository;
import com.siscoca.repository.HistoricoSemanalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Optional;

@Service
public class HistoricoService {
    
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy[ HH:mm]");
    
    @Autowired
    private HistoricoSemanalRepository historicoRepository;
    
    @Autowired
    private CampanaRepository campanaRepository;
    
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
                    // Solo actualizar semanaISO si se proporciona
                    if (historico.getSemanaISO() != null) {
                        existing.setSemanaISO(historico.getSemanaISO());
                    }
                    // Solo actualizar métricas del trafficker si se proporcionan (merge, no reemplazo)
                    if (historico.getAlcance() != null) {
                        existing.setAlcance(historico.getAlcance());
                    }
                    if (historico.getClics() != null) {
                        existing.setClics(historico.getClics());
                    }
                    if (historico.getLeads() != null) {
                        existing.setLeads(historico.getLeads());
                    }
                    if (historico.getCostoSemanal() != null) {
                        existing.setCostoSemanal(historico.getCostoSemanal());
                    }
                    if (historico.getCostoLead() != null) {
                        existing.setCostoLead(historico.getCostoLead());
                    }
                    // Solo actualizar métricas del dueño si se proporcionan (merge, no reemplazo)
                    if (historico.getConductoresRegistrados() != null) {
                        existing.setConductoresRegistrados(historico.getConductoresRegistrados());
                    }
                    if (historico.getConductoresPrimerViaje() != null) {
                        existing.setConductoresPrimerViaje(historico.getConductoresPrimerViaje());
                    }
                    if (historico.getCostoConductorRegistrado() != null) {
                        existing.setCostoConductorRegistrado(historico.getCostoConductorRegistrado());
                    }
                    if (historico.getCostoConductorPrimerViaje() != null) {
                        existing.setCostoConductorPrimerViaje(historico.getCostoConductorPrimerViaje());
                    }
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
    
    @Transactional
    public HistoricoImportResponseDto importarRegistros(List<HistoricoImportDto> registros) {
        HistoricoImportResponseDto respuesta = new HistoricoImportResponseDto();
        
        if (registros == null || registros.isEmpty()) {
            respuesta.addError("No se recibieron registros para importar.");
            return respuesta;
        }
        
        respuesta.setRegistrosProcesados(registros.size());
        
        for (HistoricoImportDto dto : registros) {
            try {
                Campana campana = obtenerCampanaParaImport(dto)
                        .orElseThrow(() -> new IllegalArgumentException("No se encontró campaña asociada"));
                
                Integer semanaISO = dto.getSemanaISO() != null ? dto.getSemanaISO() : getPreviousWeekISO();
                
                HistoricoSemanal historico = historicoRepository.findByCampana_IdAndSemanaISO(campana.getId(), semanaISO)
                        .orElse(new HistoricoSemanal());
                
                boolean esNuevo = historico.getId() == null;
                
                historico.setCampana(campana);
                historico.setSemanaISO(semanaISO);
                historico.setFechaSemana(parseFecha(dto.getFechaArchivo()));
                historico.setAlcance(dto.getAlcance());
                historico.setClics(dto.getClics());
                historico.setLeads(dto.getLeads() != null ? Math.round(dto.getLeads()) : null);
                historico.setCostoSemanal(dto.getCostoSemanal());
                historico.setCostoLead(dto.getCostoLead());
                historico.setConductoresRegistrados(dto.getConductoresRegistrados());
                historico.setConductoresPrimerViaje(dto.getConductoresPrimerViaje());
                
                if (dto.getCostoConductorRegistrado() != null) {
                    historico.setCostoConductorRegistrado(dto.getCostoConductorRegistrado());
                } else if (dto.getConductoresRegistrados() != null && dto.getConductoresRegistrados() > 0 && dto.getCostoSemanal() != null) {
                    historico.setCostoConductorRegistrado(dto.getCostoSemanal() / dto.getConductoresRegistrados());
                }
                
                if (dto.getCostoConductorPrimerViaje() != null) {
                    historico.setCostoConductorPrimerViaje(dto.getCostoConductorPrimerViaje());
                } else if (dto.getConductoresPrimerViaje() != null && dto.getConductoresPrimerViaje() > 0 && dto.getCostoSemanal() != null) {
                    historico.setCostoConductorPrimerViaje(dto.getCostoSemanal() / dto.getConductoresPrimerViaje());
                }
                
                historico.setRegistradoPor(StringUtils.hasText(dto.getRegistradoPor()) ? dto.getRegistradoPor() : "Importación CSV");
                
                historicoRepository.save(historico);
                
                if (esNuevo) {
                    respuesta.setRegistrosCreados(respuesta.getRegistrosCreados() + 1);
                } else {
                    respuesta.setRegistrosActualizados(respuesta.getRegistrosActualizados() + 1);
                }
            } catch (Exception ex) {
                respuesta.addError(construirMensajeError(dto, ex.getMessage()));
            }
        }
        
        return respuesta;
    }
    
    private Optional<Campana> obtenerCampanaParaImport(HistoricoImportDto dto) {
        if (dto.getCampanaId() != null) {
            Optional<Campana> campana = campanaRepository.findById(dto.getCampanaId());
            if (campana.isPresent()) {
                return campana;
            }
        }
        
        if (StringUtils.hasText(dto.getCampanaIdPlataforma())) {
            Optional<Campana> campana = campanaRepository.findByIdPlataformaExterna(dto.getCampanaIdPlataforma());
            if (campana.isPresent()) {
                return campana;
            }
        }
        
        if (StringUtils.hasText(dto.getCampanaNombre())) {
            Optional<Campana> campana = campanaRepository.findByNombre(dto.getCampanaNombre());
            if (campana.isPresent()) {
                return campana;
            }
        }
        
        return Optional.empty();
    }
    
    private LocalDateTime parseFecha(String fecha) {
        if (!StringUtils.hasText(fecha)) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(fecha, DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            try {
                return LocalDate.parse(fecha, DateTimeFormatter.ofPattern("dd/MM/yyyy")).atStartOfDay();
            } catch (DateTimeParseException ex) {
                return LocalDateTime.now();
            }
        }
    }
    
    private String construirMensajeError(HistoricoImportDto dto, String motivo) {
        StringBuilder sb = new StringBuilder("Registro ");
        if (StringUtils.hasText(dto.getCampanaNombre())) {
            sb.append("[").append(dto.getCampanaNombre()).append("] ");
        }
        if (dto.getSemanaISO() != null) {
            sb.append("(semana ").append(dto.getSemanaISO()).append(") ");
        }
        sb.append("no se pudo importar: ").append(motivo);
        return sb.toString();
    }
}
