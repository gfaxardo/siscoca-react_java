package com.siscoca.dto;

import java.util.List;

public class MetricasGlobalesDto {
    
    private Double costoTotal;
    private Long alcanceTotal;
    private Long leadsTotales;
    private Long conductoresTotales;
    private Double costoPromedioLead;
    private Double costoPromedioConductor;
    private Double roi;
    private List<EvaluacionMetricaDto> evaluaciones;
    
    // Constructors
    public MetricasGlobalesDto() {}
    
    // Getters and Setters
    public Double getCostoTotal() {
        return costoTotal;
    }
    
    public void setCostoTotal(Double costoTotal) {
        this.costoTotal = costoTotal;
    }
    
    public Long getAlcanceTotal() {
        return alcanceTotal;
    }
    
    public void setAlcanceTotal(Long alcanceTotal) {
        this.alcanceTotal = alcanceTotal;
    }
    
    public Long getLeadsTotales() {
        return leadsTotales;
    }
    
    public void setLeadsTotales(Long leadsTotales) {
        this.leadsTotales = leadsTotales;
    }
    
    public Long getConductoresTotales() {
        return conductoresTotales;
    }
    
    public void setConductoresTotales(Long conductoresTotales) {
        this.conductoresTotales = conductoresTotales;
    }
    
    public Double getCostoPromedioLead() {
        return costoPromedioLead;
    }
    
    public void setCostoPromedioLead(Double costoPromedioLead) {
        this.costoPromedioLead = costoPromedioLead;
    }
    
    public Double getCostoPromedioConductor() {
        return costoPromedioConductor;
    }
    
    public void setCostoPromedioConductor(Double costoPromedioConductor) {
        this.costoPromedioConductor = costoPromedioConductor;
    }
    
    public Double getRoi() {
        return roi;
    }
    
    public void setRoi(Double roi) {
        this.roi = roi;
    }
    
    public List<EvaluacionMetricaDto> getEvaluaciones() {
        return evaluaciones;
    }
    
    public void setEvaluaciones(List<EvaluacionMetricaDto> evaluaciones) {
        this.evaluaciones = evaluaciones;
    }
}
