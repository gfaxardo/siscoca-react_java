package com.siscoca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "tareas_pendientes")
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"campana", "hibernateLazyInitializer", "handler"})
public class TareaPendiente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_tarea", nullable = false)
    private TipoTarea tipoTarea;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campana_id", nullable = false)
    private Campana campana;
    
    @Column(name = "asignado_a")
    private String asignadoA; // Nombre del dueño específico o username del trafficker
    
    @Column(name = "responsable_rol")
    @Enumerated(EnumType.STRING)
    private Rol responsableRol;
    
    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(name = "urgente")
    private Boolean urgente = false;
    
    @Column(name = "completada")
    private Boolean completada = false;
    
    @Column(name = "fecha_completada")
    private LocalDateTime fechaCompletada;
    
    @CreatedDate
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    // Constructors
    public TareaPendiente() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public TipoTarea getTipoTarea() {
        return tipoTarea;
    }
    
    public void setTipoTarea(TipoTarea tipoTarea) {
        this.tipoTarea = tipoTarea;
    }
    
    public Campana getCampana() {
        return campana;
    }
    
    public void setCampana(Campana campana) {
        this.campana = campana;
    }
    
    public String getAsignadoA() {
        return asignadoA;
    }
    
    public void setAsignadoA(String asignadoA) {
        this.asignadoA = asignadoA;
    }
    
    public Rol getResponsableRol() {
        return responsableRol;
    }
    
    public void setResponsableRol(Rol responsableRol) {
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
        if (completada && this.fechaCompletada == null) {
            this.fechaCompletada = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getFechaCompletada() {
        return fechaCompletada;
    }
    
    public void setFechaCompletada(LocalDateTime fechaCompletada) {
        this.fechaCompletada = fechaCompletada;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}






