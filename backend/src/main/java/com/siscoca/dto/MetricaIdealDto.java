package com.siscoca.dto;

import java.time.LocalDateTime;

public class MetricaIdealDto {
    
    private Long id;
    private String nombre;
    private Double valorIdeal;
    private Double valorMinimo;
    private Double valorMaximo;
    private String unidad;
    private String categoria;
    private String vertical;
    private String pais;
    private String plataforma;
    private String segmento;
    private Boolean activa;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public Double getValorIdeal() {
        return valorIdeal;
    }
    
    public void setValorIdeal(Double valorIdeal) {
        this.valorIdeal = valorIdeal;
    }
    
    public Double getValorMinimo() {
        return valorMinimo;
    }
    
    public void setValorMinimo(Double valorMinimo) {
        this.valorMinimo = valorMinimo;
    }
    
    public Double getValorMaximo() {
        return valorMaximo;
    }
    
    public void setValorMaximo(Double valorMaximo) {
        this.valorMaximo = valorMaximo;
    }
    
    public String getUnidad() {
        return unidad;
    }
    
    public void setUnidad(String unidad) {
        this.unidad = unidad;
    }
    
    public String getCategoria() {
        return categoria;
    }
    
    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }
    
    public String getVertical() {
        return vertical;
    }
    
    public void setVertical(String vertical) {
        this.vertical = vertical;
    }
    
    public String getPais() {
        return pais;
    }
    
    public void setPais(String pais) {
        this.pais = pais;
    }
    
    public String getPlataforma() {
        return plataforma;
    }
    
    public void setPlataforma(String plataforma) {
        this.plataforma = plataforma;
    }
    
    public String getSegmento() {
        return segmento;
    }
    
    public void setSegmento(String segmento) {
        this.segmento = segmento;
    }
    
    public Boolean getActiva() {
        return activa;
    }
    
    public void setActiva(Boolean activa) {
        this.activa = activa;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaActualizacion() {
        return fechaActualizacion;
    }
    
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) {
        this.fechaActualizacion = fechaActualizacion;
    }
}

