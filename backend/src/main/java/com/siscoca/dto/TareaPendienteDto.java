package com.siscoca.dto;

import java.time.LocalDateTime;

public class TareaPendienteDto {
    
    private Long id;
    private String tipoTarea;
    private Long campanaId;
    private String campanaNombre;
    private String asignadoA;
    private String responsableRol;
    private String descripcion;
    private Boolean urgente;
    private Boolean completada;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaCompletada;
    
    // Constructors
    public TareaPendienteDto() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTipoTarea() {
        return tipoTarea;
    }
    
    public void setTipoTarea(String tipoTarea) {
        this.tipoTarea = tipoTarea;
    }
    
    public Long getCampanaId() {
        return campanaId;
    }
    
    public void setCampanaId(Long campanaId) {
        this.campanaId = campanaId;
    }
    
    public String getCampanaNombre() {
        return campanaNombre;
    }
    
    public void setCampanaNombre(String campanaNombre) {
        this.campanaNombre = campanaNombre;
    }
    
    public String getAsignadoA() {
        return asignadoA;
    }
    
    public void setAsignadoA(String asignadoA) {
        this.asignadoA = asignadoA;
    }
    
    public String getResponsableRol() {
        return responsableRol;
    }
    
    public void setResponsableRol(String responsableRol) {
        this.responsableRol = responsableRol;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public Boolean getUrgente() {
        return urgente;
    }
    
    public void setUrgente(Boolean urgente) {
        this.urgente = urgente;
    }
    
    public Boolean getCompletada() {
        return completada;
    }
    
    public void setCompletada(Boolean completada) {
        this.completada = completada;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public LocalDateTime getFechaCompletada() {
        return fechaCompletada;
    }
    
    public void setFechaCompletada(LocalDateTime fechaCompletada) {
        this.fechaCompletada = fechaCompletada;
    }
}







