package com.siscoca.service;

import com.siscoca.dto.CampanaDto;
import com.siscoca.model.*;
import com.siscoca.repository.CampanaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.WeekFields;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class CampanaService {
    
    @Autowired
    private CampanaRepository campanaRepository;
    
    public List<CampanaDto> getAllCampanas() {
        return campanaRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public CampanaDto getCampanaById(Long id) {
        return campanaRepository.findById(id)
                .map(this::convertToDto)
                .orElse(null);
    }
    
    public CampanaDto createCampana(CampanaDto campanaDto) {
        Campana campana = convertToEntity(campanaDto);
        campana.setEstado(EstadoCampana.PENDIENTE);
        campana.setFechaCreacion(LocalDateTime.now());
        campana.setFechaActualizacion(LocalDateTime.now());
        campana.setSemanaISO(getCurrentWeekISO());
        
        Campana savedCampana = campanaRepository.save(campana);
        return convertToDto(savedCampana);
    }
    
    public CampanaDto updateCampana(Long id, CampanaDto campanaDto) {
        return campanaRepository.findById(id)
                .map(existingCampana -> {
                    updateCampanaFromDto(existingCampana, campanaDto);
                    existingCampana.setFechaActualizacion(LocalDateTime.now());
                    return convertToDto(campanaRepository.save(existingCampana));
                })
                .orElse(null);
    }
    
    public boolean deleteCampana(Long id) {
        if (campanaRepository.existsById(id)) {
            campanaRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public List<CampanaDto> getCampanasByEstado(String estado) {
        try {
            EstadoCampana estadoEnum = EstadoCampana.valueOf(estado.toUpperCase());
            return campanaRepository.findByEstado(estadoEnum).stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
    
    public List<CampanaDto> getCampanasByDueno(String nombreDueno) {
        return campanaRepository.findByNombreDueno(nombreDueno).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private CampanaDto convertToDto(Campana campana) {
        CampanaDto dto = new CampanaDto();
        dto.setId(campana.getId());
        dto.setNombre(campana.getNombre());
        dto.setPais(campana.getPais().name());
        dto.setVertical(campana.getVertical().name());
        dto.setPlataforma(campana.getPlataforma().name());
        dto.setSegmento(campana.getSegmento().name());
        dto.setIdPlataformaExterna(campana.getIdPlataformaExterna());
        dto.setNombreDueno(campana.getNombreDueno());
        dto.setInicialesDueno(campana.getInicialesDueno());
        dto.setDescripcionCorta(campana.getDescripcionCorta());
        dto.setObjetivo(campana.getObjetivo());
        dto.setBeneficio(campana.getBeneficio());
        dto.setDescripcion(campana.getDescripcion());
        dto.setEstado(campana.getEstado().getDisplayName());
        dto.setArchivoCreativo(campana.getArchivoCreativo());
        dto.setNombreArchivoCreativo(campana.getNombreArchivoCreativo());
        dto.setUrlInforme(campana.getUrlInforme());
        dto.setAlcance(campana.getAlcance());
        dto.setClics(campana.getClics());
        dto.setLeads(campana.getLeads());
        dto.setCostoSemanal(campana.getCostoSemanal());
        dto.setCostoLead(campana.getCostoLead());
        dto.setConductoresRegistrados(campana.getConductoresRegistrados());
        dto.setConductoresPrimerViaje(campana.getConductoresPrimerViaje());
        dto.setCostoConductorRegistrado(campana.getCostoConductorRegistrado());
        dto.setCostoConductorPrimerViaje(campana.getCostoConductorPrimerViaje());
        dto.setFechaCreacion(campana.getFechaCreacion());
        dto.setFechaActualizacion(campana.getFechaActualizacion());
        dto.setSemanaISO(campana.getSemanaISO());
        return dto;
    }
    
    private Campana convertToEntity(CampanaDto dto) {
        Campana campana = new Campana();
        campana.setNombre(dto.getNombre());
        campana.setPais(Pais.valueOf(dto.getPais()));
        campana.setVertical(Vertical.valueOf(dto.getVertical()));
        campana.setPlataforma(Plataforma.valueOf(dto.getPlataforma()));
        campana.setSegmento(Segmento.valueOf(dto.getSegmento()));
        campana.setIdPlataformaExterna(dto.getIdPlataformaExterna());
        campana.setNombreDueno(dto.getNombreDueno());
        campana.setInicialesDueno(dto.getInicialesDueno());
        campana.setDescripcionCorta(dto.getDescripcionCorta());
        campana.setObjetivo(dto.getObjetivo());
        campana.setBeneficio(dto.getBeneficio());
        campana.setDescripcion(dto.getDescripcion());
        campana.setArchivoCreativo(dto.getArchivoCreativo());
        campana.setNombreArchivoCreativo(dto.getNombreArchivoCreativo());
        campana.setUrlInforme(dto.getUrlInforme());
        campana.setAlcance(dto.getAlcance());
        campana.setClics(dto.getClics());
        campana.setLeads(dto.getLeads());
        campana.setCostoSemanal(dto.getCostoSemanal());
        campana.setCostoLead(dto.getCostoLead());
        campana.setConductoresRegistrados(dto.getConductoresRegistrados());
        campana.setConductoresPrimerViaje(dto.getConductoresPrimerViaje());
        campana.setCostoConductorRegistrado(dto.getCostoConductorRegistrado());
        campana.setCostoConductorPrimerViaje(dto.getCostoConductorPrimerViaje());
        return campana;
    }
    
    private void updateCampanaFromDto(Campana campana, CampanaDto dto) {
        if (dto.getNombre() != null) campana.setNombre(dto.getNombre());
        if (dto.getPais() != null) campana.setPais(Pais.valueOf(dto.getPais()));
        if (dto.getVertical() != null) campana.setVertical(Vertical.valueOf(dto.getVertical()));
        if (dto.getPlataforma() != null) campana.setPlataforma(Plataforma.valueOf(dto.getPlataforma()));
        if (dto.getSegmento() != null) campana.setSegmento(Segmento.valueOf(dto.getSegmento()));
        if (dto.getIdPlataformaExterna() != null) campana.setIdPlataformaExterna(dto.getIdPlataformaExterna());
        if (dto.getNombreDueno() != null) campana.setNombreDueno(dto.getNombreDueno());
        if (dto.getInicialesDueno() != null) campana.setInicialesDueno(dto.getInicialesDueno());
        if (dto.getDescripcionCorta() != null) campana.setDescripcionCorta(dto.getDescripcionCorta());
        if (dto.getObjetivo() != null) campana.setObjetivo(dto.getObjetivo());
        if (dto.getBeneficio() != null) campana.setBeneficio(dto.getBeneficio());
        if (dto.getDescripcion() != null) campana.setDescripcion(dto.getDescripcion());
        if (dto.getEstado() != null) campana.setEstado(EstadoCampana.valueOf(dto.getEstado().toUpperCase()));
        if (dto.getArchivoCreativo() != null) campana.setArchivoCreativo(dto.getArchivoCreativo());
        if (dto.getNombreArchivoCreativo() != null) campana.setNombreArchivoCreativo(dto.getNombreArchivoCreativo());
        if (dto.getUrlInforme() != null) campana.setUrlInforme(dto.getUrlInforme());
        if (dto.getAlcance() != null) campana.setAlcance(dto.getAlcance());
        if (dto.getClics() != null) campana.setClics(dto.getClics());
        if (dto.getLeads() != null) campana.setLeads(dto.getLeads());
        if (dto.getCostoSemanal() != null) campana.setCostoSemanal(dto.getCostoSemanal());
        if (dto.getCostoLead() != null) campana.setCostoLead(dto.getCostoLead());
        if (dto.getConductoresRegistrados() != null) campana.setConductoresRegistrados(dto.getConductoresRegistrados());
        if (dto.getConductoresPrimerViaje() != null) campana.setConductoresPrimerViaje(dto.getConductoresPrimerViaje());
        if (dto.getCostoConductorRegistrado() != null) campana.setCostoConductorRegistrado(dto.getCostoConductorRegistrado());
        if (dto.getCostoConductorPrimerViaje() != null) campana.setCostoConductorPrimerViaje(dto.getCostoConductorPrimerViaje());
    }
    
    private int getCurrentWeekISO() {
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        return LocalDateTime.now().get(weekFields.weekOfWeekBasedYear());
    }
}
