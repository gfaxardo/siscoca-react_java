package com.siscoca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "creativos")
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Creativo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campana_id", nullable = false)
    private Campana campana;
    
    @Column(name = "archivo_creativo", columnDefinition = "TEXT")
    private String archivoCreativo; // Base64 del archivo
    
    @Column(name = "nombre_archivo_creativo", length = 500)
    private String nombreArchivoCreativo;
    
    @Column(name = "url_creativo_externo", columnDefinition = "TEXT")
    @JsonProperty("urlCreativoExterno")
    private String urlCreativoExterno;
    
    @Column(nullable = false)
    private Boolean activo = true; // Si está activo o descartado
    
    @Column(name = "orden", nullable = false)
    private Integer orden = 0; // Orden de prioridad (0 = más importante)
    
    @CreatedDate
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @LastModifiedDate
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // Constructors
    public Creativo() {}
    
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
    
    public String getArchivoCreativo() {
        return archivoCreativo;
    }
    
    public void setArchivoCreativo(String archivoCreativo) {
        this.archivoCreativo = archivoCreativo;
    }
    
    public String getNombreArchivoCreativo() {
        return nombreArchivoCreativo;
    }
    
    public void setNombreArchivoCreativo(String nombreArchivoCreativo) {
        this.nombreArchivoCreativo = nombreArchivoCreativo;
    }
    
    public String getUrlCreativoExterno() {
        return urlCreativoExterno;
    }
    
    public void setUrlCreativoExterno(String urlCreativoExterno) {
        this.urlCreativoExterno = urlCreativoExterno;
    }
    
    public Boolean getActivo() {
        return activo;
    }
    
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
    
    public Integer getOrden() {
        return orden;
    }
    
    public void setOrden(Integer orden) {
        this.orden = orden;
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

