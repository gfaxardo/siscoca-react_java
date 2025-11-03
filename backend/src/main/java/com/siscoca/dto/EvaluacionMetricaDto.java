package com.siscoca.dto;

public class EvaluacionMetricaDto {
    
    private String metrica;
    private Double valorActual;
    private Double valorIdeal;
    private String estado;
    private Double porcentajeDesviacion;
    private String recomendacion;
    private String color;
    
    // Constructors
    public EvaluacionMetricaDto() {}
    
    // Getters and Setters
    public String getMetrica() {
        return metrica;
    }
    
    public void setMetrica(String metrica) {
        this.metrica = metrica;
    }
    
    public Double getValorActual() {
        return valorActual;
    }
    
    public void setValorActual(Double valorActual) {
        this.valorActual = valorActual;
    }
    
    public Double getValorIdeal() {
        return valorIdeal;
    }
    
    public void setValorIdeal(Double valorIdeal) {
        this.valorIdeal = valorIdeal;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
        this.estado = estado;
    }
    
    public Double getPorcentajeDesviacion() {
        return porcentajeDesviacion;
    }
    
    public void setPorcentajeDesviacion(Double porcentajeDesviacion) {
        this.porcentajeDesviacion = porcentajeDesviacion;
    }
    
    public String getRecomendacion() {
        return recomendacion;
    }
    
    public void setRecomendacion(String recomendacion) {
        this.recomendacion = recomendacion;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
}
