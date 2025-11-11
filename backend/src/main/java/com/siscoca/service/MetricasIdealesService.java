package com.siscoca.service;

import com.siscoca.dto.MetricaIdealDto;
import com.siscoca.model.CategoriaMetrica;
import com.siscoca.model.MetricaIdeal;
import com.siscoca.model.Pais;
import com.siscoca.model.Plataforma;
import com.siscoca.model.Segmento;
import com.siscoca.model.Vertical;
import com.siscoca.repository.MetricaIdealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MetricasIdealesService {
    
    @Autowired
    private MetricaIdealRepository metricaIdealRepository;
    
    public List<MetricaIdealDto> listarMetricas(Optional<String> vertical,
                                                Optional<String> pais,
                                                Optional<String> plataforma,
                                                Optional<String> segmento,
                                                Optional<Boolean> activa) {
        List<MetricaIdeal> metricas = metricaIdealRepository.findByActivaTrue();
        
        if (vertical.isPresent() && StringUtils.hasText(vertical.get())) {
            Vertical verticalEnum = Vertical.fromDisplayName(vertical.get());
            metricas = metricas.stream()
                    .filter(m -> verticalEnum.equals(m.getVertical()))
                    .collect(Collectors.toList());
        }
        
        if (pais.isPresent() && StringUtils.hasText(pais.get())) {
            Pais paisEnum = Pais.fromDisplayName(pais.get());
            metricas = metricas.stream()
                    .filter(m -> paisEnum.equals(m.getPais()))
                    .collect(Collectors.toList());
        }
        
        if (plataforma.isPresent() && StringUtils.hasText(plataforma.get())) {
            Plataforma plataformaEnum = Plataforma.fromDisplayName(plataforma.get());
            metricas = metricas.stream()
                    .filter(m -> plataformaEnum.equals(m.getPlataforma()))
                    .collect(Collectors.toList());
        }
        
        if (segmento.isPresent() && StringUtils.hasText(segmento.get())) {
            Segmento segmentoEnum = Segmento.fromDisplayName(segmento.get());
            metricas = metricas.stream()
                    .filter(m -> segmentoEnum.equals(m.getSegmento()))
                    .collect(Collectors.toList());
        }
        
        if (activa.isPresent()) {
            metricas = metricas.stream()
                    .filter(m -> activa.get().equals(m.getActiva()))
                    .collect(Collectors.toList());
        }
        
        return metricas.stream()
                .sorted(Comparator.comparing(MetricaIdeal::getCategoria).thenComparing(MetricaIdeal::getNombre))
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public MetricaIdealDto crearMetrica(MetricaIdealDto dto) {
        MetricaIdeal metricaIdeal = fromDto(dto, new MetricaIdeal());
        MetricaIdeal guardada = metricaIdealRepository.save(metricaIdeal);
        return toDto(guardada);
    }
    
    @Transactional
    public MetricaIdealDto actualizarMetrica(Long id, MetricaIdealDto dto) {
        MetricaIdeal existente = metricaIdealRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Métrica ideal no encontrada"));
        MetricaIdeal actualizado = fromDto(dto, existente);
        return toDto(metricaIdealRepository.save(actualizado));
    }
    
    @Transactional
    public List<MetricaIdealDto> guardarMetricas(List<MetricaIdealDto> metricas) {
        List<MetricaIdealDto> resultado = new ArrayList<>();
        
        for (MetricaIdealDto dto : metricas) {
            if (dto.getId() == null) {
                resultado.add(crearMetrica(dto));
            } else {
                resultado.add(actualizarMetrica(dto.getId(), dto));
            }
        }
        
        return resultado;
    }
    
    @Transactional
    public void eliminarMetrica(Long id) {
        if (!metricaIdealRepository.existsById(id)) {
            throw new IllegalArgumentException("Métrica ideal no encontrada");
        }
        metricaIdealRepository.deleteById(id);
    }
    
    private MetricaIdealDto toDto(MetricaIdeal metricaIdeal) {
        MetricaIdealDto dto = new MetricaIdealDto();
        dto.setId(metricaIdeal.getId());
        dto.setNombre(metricaIdeal.getNombre());
        dto.setValorIdeal(metricaIdeal.getValorIdeal());
        dto.setValorMinimo(metricaIdeal.getValorMinimo());
        dto.setValorMaximo(metricaIdeal.getValorMaximo());
        dto.setUnidad(metricaIdeal.getUnidad());
        dto.setCategoria(metricaIdeal.getCategoria() != null ? metricaIdeal.getCategoria().name() : null);
        dto.setVertical(metricaIdeal.getVertical() != null ? metricaIdeal.getVertical().getDisplayName() : null);
        dto.setPais(metricaIdeal.getPais() != null ? metricaIdeal.getPais().getDisplayName() : null);
        dto.setPlataforma(metricaIdeal.getPlataforma() != null ? metricaIdeal.getPlataforma().getDisplayName() : null);
        dto.setSegmento(metricaIdeal.getSegmento() != null ? metricaIdeal.getSegmento().getDisplayName() : null);
        dto.setActiva(metricaIdeal.getActiva());
        dto.setFechaCreacion(metricaIdeal.getFechaCreacion());
        dto.setFechaActualizacion(metricaIdeal.getFechaActualizacion());
        return dto;
    }
    
    private MetricaIdeal fromDto(MetricaIdealDto dto, MetricaIdeal entidad) {
        if (StringUtils.hasText(dto.getNombre())) {
            entidad.setNombre(dto.getNombre().trim());
        }
        entidad.setValorIdeal(dto.getValorIdeal());
        entidad.setValorMinimo(dto.getValorMinimo());
        entidad.setValorMaximo(dto.getValorMaximo());
        entidad.setUnidad(dto.getUnidad());
        
        if (StringUtils.hasText(dto.getCategoria())) {
            entidad.setCategoria(CategoriaMetrica.valueOf(dto.getCategoria().toUpperCase(Locale.ROOT)));
        }
        
        if (StringUtils.hasText(dto.getVertical())) {
            entidad.setVertical(Vertical.fromDisplayName(dto.getVertical()));
        } else {
            entidad.setVertical(null);
        }
        
        if (StringUtils.hasText(dto.getPais())) {
            entidad.setPais(Pais.fromDisplayName(dto.getPais()));
        } else {
            entidad.setPais(null);
        }
        
        if (StringUtils.hasText(dto.getPlataforma())) {
            entidad.setPlataforma(Plataforma.fromDisplayName(dto.getPlataforma()));
        } else {
            entidad.setPlataforma(null);
        }
        
        if (StringUtils.hasText(dto.getSegmento())) {
            entidad.setSegmento(Segmento.fromDisplayName(dto.getSegmento()));
        } else {
            entidad.setSegmento(null);
        }
        
        entidad.setActiva(dto.getActiva() == null || dto.getActiva());
        return entidad;
    }
}

