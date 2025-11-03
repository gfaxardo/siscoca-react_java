package com.siscoca.service;

import com.siscoca.dto.CampanaDto;
import com.siscoca.dto.MetricasGlobalesDto;
import com.siscoca.dto.EvaluacionMetricaDto;
import com.siscoca.model.*;
import com.siscoca.repository.CampanaRepository;
import com.siscoca.repository.MetricaIdealRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MetricasService {
    
    @Autowired
    private CampanaRepository campanaRepository;
    
    @Autowired
    private MetricaIdealRepository metricaIdealRepository;
    
    public MetricasGlobalesDto calcularMetricasGlobales(Long idCampana) {
        Campana campana = campanaRepository.findById(idCampana).orElse(null);
        if (campana == null) {
            return null;
        }
        
        MetricasGlobalesDto metricas = new MetricasGlobalesDto();
        
        // Calcular totales
        metricas.setCostoTotal(campana.getCostoSemanal() != null ? campana.getCostoSemanal() : 0.0);
        metricas.setAlcanceTotal(campana.getAlcance() != null ? campana.getAlcance() : 0L);
        metricas.setLeadsTotales(campana.getLeads() != null ? campana.getLeads() : 0L);
        metricas.setConductoresTotales(campana.getConductoresRegistrados() != null ? campana.getConductoresRegistrados() : 0L);
        
        // Calcular promedios
        if (metricas.getLeadsTotales() > 0) {
            metricas.setCostoPromedioLead(metricas.getCostoTotal() / metricas.getLeadsTotales());
        }
        
        if (metricas.getConductoresTotales() > 0) {
            metricas.setCostoPromedioConductor(metricas.getCostoTotal() / metricas.getConductoresTotales());
        }
        
        // Calcular ROI (simplificado)
        if (metricas.getCostoTotal() > 0) {
            metricas.setRoi((metricas.getConductoresTotales() * 100.0) / metricas.getCostoTotal());
        }
        
        // Evaluar métricas contra ideales
        metricas.setEvaluaciones(evaluarMetricas(campana));
        
        return metricas;
    }
    
    private List<EvaluacionMetricaDto> evaluarMetricas(Campana campana) {
        List<EvaluacionMetricaDto> evaluaciones = new ArrayList<>();
        
        // Obtener métricas ideales para esta campaña
        List<MetricaIdeal> metricasIdeales = metricaIdealRepository.findByVerticalAndPaisAndPlataformaAndSegmentoAndActivaTrue(
            campana.getVertical(), campana.getPais(), campana.getPlataforma(), campana.getSegmento()
        );
        
        // Evaluar cada métrica
        evaluaciones.add(evaluarMetrica("Alcance", campana.getAlcance(), metricasIdeales, "ALCANCE"));
        evaluaciones.add(evaluarMetrica("Leads", campana.getLeads(), metricasIdeales, "LEADS"));
        evaluaciones.add(evaluarMetrica("Costo Semanal", campana.getCostoSemanal(), metricasIdeales, "COSTO"));
        evaluaciones.add(evaluarMetrica("Conductores", campana.getConductoresRegistrados(), metricasIdeales, "CONDUCTORES"));
        
        // Calcular costo por conductor dinámicamente (usando conductoresPrimerViaje)
        Double costoConductor = null;
        if (campana.getCostoSemanal() != null && campana.getConductoresPrimerViaje() != null && campana.getConductoresPrimerViaje() > 0) {
            costoConductor = campana.getCostoSemanal() / campana.getConductoresPrimerViaje();
        }
        evaluaciones.add(evaluarMetrica("Costo por Conductor", costoConductor, metricasIdeales, "COSTO"));
        
        return evaluaciones.stream().filter(e -> e != null).collect(Collectors.toList());
    }
    
    private EvaluacionMetricaDto evaluarMetrica(String nombre, Number valorActual, List<MetricaIdeal> metricasIdeales, String categoria) {
        if (valorActual == null) return null;
        
        MetricaIdeal metricaIdeal = metricasIdeales.stream()
            .filter(m -> m.getCategoria().name().equals(categoria))
            .findFirst()
            .orElse(null);
        
        if (metricaIdeal == null) return null;
        
        EvaluacionMetricaDto evaluacion = new EvaluacionMetricaDto();
        evaluacion.setMetrica(nombre);
        evaluacion.setValorActual(valorActual.doubleValue());
        evaluacion.setValorIdeal(metricaIdeal.getValorIdeal());
        
        double porcentaje = (valorActual.doubleValue() / metricaIdeal.getValorIdeal()) * 100;
        evaluacion.setPorcentajeDesviacion(porcentaje);
        
        // Determinar estado
        if (porcentaje >= 90) {
            evaluacion.setEstado("EXCELENTE");
            evaluacion.setColor("#10b981");
            evaluacion.setRecomendacion("Excelente rendimiento");
        } else if (porcentaje >= 70) {
            evaluacion.setEstado("BUENO");
            evaluacion.setColor("#f59e0b");
            evaluacion.setRecomendacion("Buen rendimiento, hay margen de mejora");
        } else if (porcentaje >= 50) {
            evaluacion.setEstado("REGULAR");
            evaluacion.setColor("#f97316");
            evaluacion.setRecomendacion("Rendimiento regular, necesita optimización");
        } else if (porcentaje >= 30) {
            evaluacion.setEstado("MALO");
            evaluacion.setColor("#ef4444");
            evaluacion.setRecomendacion("Rendimiento bajo, requiere atención inmediata");
        } else {
            evaluacion.setEstado("CRITICO");
            evaluacion.setColor("#7f1d1d");
            evaluacion.setRecomendacion("Rendimiento crítico, revisar estrategia");
        }
        
        return evaluacion;
    }
}
