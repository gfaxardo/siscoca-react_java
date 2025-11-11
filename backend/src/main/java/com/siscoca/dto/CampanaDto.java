package com.siscoca.dto;

import com.siscoca.model.*;
import java.time.LocalDateTime;


public class CampanaDto {
    
    private Long id;
    private String nombre;
    private String pais;
    private String vertical;
    private String plataforma;
    private String segmento;
    private String idPlataformaExterna;
    private String nombreDueno;
    private String inicialesDueno;
    private String descripcionCorta;
    private String objetivo;
    private String beneficio;
    private String descripcion;
    private String tipoAterrizaje;
    private String urlAterrizaje;
    private String detalleAterrizaje;
    private String nombrePlataforma;
    private String estado;
    private String archivoCreativo;
    private String nombreArchivoCreativo;
    private String urlCreativoExterno;
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
    private Double costoConductor; // en USD - Costo por conductor
    
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private Integer semanaISO;
    
    // Constructors
    public CampanaDto() {}
    
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
    
    public String getPais() {
        return pais;
    }
    
    public void setPais(String pais) {
        this.pais = pais;
    }
    
    public String getVertical() {
        return vertical;
    }
    
    public void setVertical(String vertical) {
        this.vertical = vertical;
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
    
    public String getTipoAterrizaje() {
        return tipoAterrizaje;
    }
    
    public void setTipoAterrizaje(String tipoAterrizaje) {
        this.tipoAterrizaje = tipoAterrizaje;
    }
    
    public String getUrlAterrizaje() {
        return urlAterrizaje;
    }
    
    public void setUrlAterrizaje(String urlAterrizaje) {
        this.urlAterrizaje = urlAterrizaje;
    }
    
    public String getDetalleAterrizaje() {
        return detalleAterrizaje;
    }
    
    public void setDetalleAterrizaje(String detalleAterrizaje) {
        this.detalleAterrizaje = detalleAterrizaje;
    }
    
    public String getNombrePlataforma() {
        return nombrePlataforma;
    }
    
    public void setNombrePlataforma(String nombrePlataforma) {
        this.nombrePlataforma = nombrePlataforma;
    }
    
    public String getEstado() {
        return estado;
    }
    
    public void setEstado(String estado) {
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
    
    public String getUrlCreativoExterno() {
        return urlCreativoExterno;
    }
    
    public void setUrlCreativoExterno(String urlCreativoExterno) {
        this.urlCreativoExterno = urlCreativoExterno;
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
    
    public Double getCostoConductor() {
        return costoConductor;
    }
    
    public void setCostoConductor(Double costoConductor) {
        this.costoConductor = costoConductor;
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
}
