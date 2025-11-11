package com.siscoca.dto;

import java.time.LocalDateTime;

public class MensajeChatDto {
    
    private Long id;
    private Long campanaId;
    private String campanaNombre;
    private String remitente;
    private String mensaje;
    private Boolean leido;
    private Boolean urgente;
    private LocalDateTime fechaCreacion;
    
    // Constructors
    public MensajeChatDto() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
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
    
    public String getRemitente() {
        return remitente;
    }
    
    public void setRemitente(String remitente) {
        this.remitente = remitente;
    }
    
    public String getMensaje() {
        return mensaje;
    }
    
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
    
    public Boolean getLeido() {
        return leido;
    }
    
    public void setLeido(Boolean leido) {
        this.leido = leido;
    }
    
    public Boolean getUrgente() {
        return urgente;
    }
    
    public void setUrgente(Boolean urgente) {
        this.urgente = urgente;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}






