package com.siscoca.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "campanas")
@EntityListeners(AuditingEntityListener.class)
public class Campana {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = true)
    private String nombre;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Pais pais;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Vertical vertical;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Plataforma plataforma;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Segmento segmento;
    
    @Column(name = "id_plataforma_externa")
    private String idPlataformaExterna;
    
    @NotBlank
    @Column(name = "nombre_dueno", nullable = false)
    private String nombreDueno;
    
    @NotBlank
    @Column(name = "iniciales_dueno", nullable = false)
    private String inicialesDueno;
    
    @NotBlank
    @Column(name = "descripcion_corta", nullable = false)
    private String descripcionCorta;
    
    @NotBlank
    @Column(nullable = false)
    private String objetivo;
    
    @NotBlank
    @Column(nullable = false)
    private String beneficio;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;
    
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCampana estado;
    
    @Column(name = "archivo_creativo")
    private String archivoCreativo;
    
    @Column(name = "nombre_archivo_creativo")
    private String nombreArchivoCreativo;
    
    @Column(name = "url_informe")
    private String urlInforme;
    
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
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @LastModifiedDate
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "semana_iso")
    private Integer semanaISO;
    
    @OneToMany(mappedBy = "campana", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoricoSemanal> historicoSemanas;
    
    // Relación con logs removida - LogEntry ahora es independiente
    
    // Constructors
    public Campana() {}
    
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
    
    public Pais getPais() {
        return pais;
    }
    
    public void setPais(Pais pais) {
        this.pais = pais;
    }
    
    public Vertical getVertical() {
        return vertical;
    }
    
    public void setVertical(Vertical vertical) {
        this.vertical = vertical;
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
    
    public String getIdPlataformaExterna() {
        return idPlataformaExterna;
    }
    
    public void setIdPlataformaExterna(String idPlataformaExterna) {
        this.idPlataformaExterna = idPlataformaExterna;
    }
    
    public String getNombreDueno() {
        return nombreDueno;
    }
    
    public void setNombreDueno(String nombreDueno) {
        this.nombreDueno = nombreDueno;
    }
    
    public String getInicialesDueno() {
        return inicialesDueno;
    }
    
    public void setInicialesDueno(String inicialesDueno) {
        this.inicialesDueno = inicialesDueno;
    }
    
    public String getDescripcionCorta() {
        return descripcionCorta;
    }
    
    public void setDescripcionCorta(String descripcionCorta) {
        this.descripcionCorta = descripcionCorta;
    }
    
    public String getObjetivo() {
        return objetivo;
    }
    
    public void setObjetivo(String objetivo) {
        this.objetivo = objetivo;
    }
    
    public String getBeneficio() {
        return beneficio;
    }
    
    public void setBeneficio(String beneficio) {
        this.beneficio = beneficio;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public EstadoCampana getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoCampana estado) {
        this.estado = estado;
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
    
    public String getUrlInforme() {
        return urlInforme;
    }
    
    public void setUrlInforme(String urlInforme) {
        this.urlInforme = urlInforme;
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
    
    public Integer getSemanaISO() {
        return semanaISO;
    }
    
    public void setSemanaISO(Integer semanaISO) {
        this.semanaISO = semanaISO;
    }
    
    public List<HistoricoSemanal> getHistoricoSemanas() {
        return historicoSemanas;
    }
    
    public void setHistoricoSemanas(List<HistoricoSemanal> historicoSemanas) {
        this.historicoSemanas = historicoSemanas;
    }
    
}
