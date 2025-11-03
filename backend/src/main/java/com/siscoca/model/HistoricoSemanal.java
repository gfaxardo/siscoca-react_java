package com.siscoca.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico_semanal")
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HistoricoSemanal {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campana_id", nullable = false)
    private Campana campana;
    
    @NotNull
    @Column(name = "semana_iso", nullable = false)
    private Integer semanaISO;
    
    @Column(name = "fecha_semana")
    private LocalDateTime fechaSemana;
    
    // Métricas del Trafficker
    private Long alcance;
    private Long clics;
    private Long leads;
    private Double costoSemanal; // en USD
    private Double costoLead; // en USD
    
    // Métricas del Dueño
    private Long conductoresRegistrados;
    private Long conductoresPrimerViaje;
    private Double costoConductorRegistrado; // en USD
    private Double costoConductorPrimerViaje; // en USD
    
    @CreatedDate
    @Column(name = "fecha_registro", nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;
    
    @Column(name = "registrado_por")
    private String registradoPor;
    
    // Constructors
    public HistoricoSemanal() {}
    
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
    
    public Integer getSemanaISO() {
        return semanaISO;
    }
    
    public void setSemanaISO(Integer semanaISO) {
        this.semanaISO = semanaISO;
    }
    
    public LocalDateTime getFechaSemana() {
        return fechaSemana;
    }
    
    public void setFechaSemana(LocalDateTime fechaSemana) {
        this.fechaSemana = fechaSemana;
    }
    
    public Long getAlcance() {
        return alcance;
    }
    
    public void setAlcance(Long alcance) {
        this.alcance = alcance;
    }
    
    public Long getClics() {
        return clics;
    }
    
    public void setClics(Long clics) {
        this.clics = clics;
    }
    
    public Long getLeads() {
        return leads;
    }
    
    public void setLeads(Long leads) {
        this.leads = leads;
    }
    
    public Double getCostoSemanal() {
        return costoSemanal;
    }
    
    public void setCostoSemanal(Double costoSemanal) {
        this.costoSemanal = costoSemanal;
    }
    
    public Double getCostoLead() {
        return costoLead;
    }
    
    public void setCostoLead(Double costoLead) {
        this.costoLead = costoLead;
    }
    
    public Long getConductoresRegistrados() {
        return conductoresRegistrados;
    }
    
    public void setConductoresRegistrados(Long conductoresRegistrados) {
        this.conductoresRegistrados = conductoresRegistrados;
    }
    
    public Long getConductoresPrimerViaje() {
        return conductoresPrimerViaje;
    }
    
    public void setConductoresPrimerViaje(Long conductoresPrimerViaje) {
        this.conductoresPrimerViaje = conductoresPrimerViaje;
    }
    
    public Double getCostoConductorRegistrado() {
        return costoConductorRegistrado;
    }
    
    public void setCostoConductorRegistrado(Double costoConductorRegistrado) {
        this.costoConductorRegistrado = costoConductorRegistrado;
    }
    
    public Double getCostoConductorPrimerViaje() {
        return costoConductorPrimerViaje;
    }
    
    public void setCostoConductorPrimerViaje(Double costoConductorPrimerViaje) {
        this.costoConductorPrimerViaje = costoConductorPrimerViaje;
    }
    
    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
    
    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
    
    public String getRegistradoPor() {
        return registradoPor;
    }
    
    public void setRegistradoPor(String registradoPor) {
        this.registradoPor = registradoPor;
    }
    
    // Método helper para obtener el ID de la campaña
    public Long getCampanaId() {
        return campana != null ? campana.getId() : null;
    }
}
