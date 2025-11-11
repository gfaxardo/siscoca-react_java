package com.siscoca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes_chat")
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"campana", "hibernateLazyInitializer", "handler"})
public class MensajeChat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campana_id", nullable = false)
    private Campana campana;
    
    @NotBlank
    @Column(name = "remitente", nullable = false)
    private String remitente; // Nombre del usuario que envía el mensaje
    
    @NotBlank
    @Column(name = "mensaje", nullable = false, columnDefinition = "TEXT")
    private String mensaje;
    
    @Column(name = "leido")
    private Boolean leido = false;
    
    @Column(name = "urgente")
    private Boolean urgente = false;
    
    @CreatedDate
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    // Constructors
    public MensajeChat() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Campana getCampana() {
        return campana;
    }
    
    public void setCampana(Campana campana) {
        this.campana = campana;
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







