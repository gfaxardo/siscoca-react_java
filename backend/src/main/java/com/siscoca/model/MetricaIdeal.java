package com.siscoca.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "metricas_ideales")
@EntityListeners(AuditingEntityListener.class)
public class MetricaIdeal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String nombre;
    
    @Column(name = "valor_ideal", nullable = false)
    private Double valorIdeal;
    
    @Column(name = "valor_minimo")
    private Double valorMinimo;
    
    @Column(name = "valor_maximo")
    private Double valorMaximo;
    
    @Column(nullable = false)
    private String unidad;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaMetrica categoria;
    
    @Enumerated(EnumType.STRING)
    private Vertical vertical;
    
    @Enumerated(EnumType.STRING)
    private Pais pais;
    
    @Enumerated(EnumType.STRING)
    private Plataforma plataforma;
    
    @Enumerated(EnumType.STRING)
    private Segmento segmento;
    
    @Column(nullable = false)
    private Boolean activa = true;
    
    @CreatedDate
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @LastModifiedDate
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    // Constructors
    public MetricaIdeal() {}
    
    // Getters and Setters
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
    
    public CategoriaMetrica getCategoria() {
        return categoria;
    }
    
    public void setCategoria(CategoriaMetrica categoria) {
        this.categoria = categoria;
    }
    
    public Vertical getVertical() {
        return vertical;
    }
    
    public void setVertical(Vertical vertical) {
        this.vertical = vertical;
    }
    
    public Pais getPais() {
        return pais;
    }
    
    public void setPais(Pais pais) {
        this.pais = pais;
    }
    
    public Plataforma getPlataforma() {
        return plataforma;
    }
    
    public void setPlataforma(Plataforma plataforma) {
        this.plataforma = plataforma;
    }
    
    public Segmento getSegmento() {
        return segmento;
    }
    
    public void setSegmento(Segmento segmento) {
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
