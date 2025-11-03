package com.siscoca.model;

import jakarta.persistence.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "historial_cambios")
@EntityListeners(AuditingEntityListener.class)
public class HistorialCambio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "id_campana", nullable = false)
    private Long idCampana;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cambio", nullable = false)
    private TipoCambio tipoCambio;
    
    @Column(name = "campo_modificado")
    private String campoModificado;
    
    @Column(name = "valor_anterior", columnDefinition = "TEXT")
    private String valorAnterior;
    
    @Column(name = "valor_nuevo", columnDefinition = "TEXT")
    private String valorNuevo;
    
    @Column(nullable = false)
    private String usuario;
    
    @Column(name = "fecha_cambio", nullable = false)
    private LocalDateTime fechaCambio;
    
    @Column(columnDefinition = "TEXT")
    private String comentario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_campana", insertable = false, updatable = false)
    private Campana campana;
    
    // Constructors
    public HistorialCambio() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getIdCampana() {
        return idCampana;
    }
    
    public void setIdCampana(Long idCampana) {
        this.idCampana = idCampana;
    }
    
    public TipoCambio getTipoCambio() {
        return tipoCambio;
    }
    
    public void setTipoCambio(TipoCambio tipoCambio) {
        this.tipoCambio = tipoCambio;
    }
    
    public String getCampoModificado() {
        return campoModificado;
    }
    
    public void setCampoModificado(String campoModificado) {
        this.campoModificado = campoModificado;
    }
    
    public String getValorAnterior() {
        return valorAnterior;
    }
    
    public void setValorAnterior(String valorAnterior) {
        this.valorAnterior = valorAnterior;
    }
    
    public String getValorNuevo() {
        return valorNuevo;
    }
    
    public void setValorNuevo(String valorNuevo) {
        this.valorNuevo = valorNuevo;
    }
    
    public String getUsuario() {
        return usuario;
    }
    
    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }
    
    public LocalDateTime getFechaCambio() {
        return fechaCambio;
    }
    
    public void setFechaCambio(LocalDateTime fechaCambio) {
        this.fechaCambio = fechaCambio;
    }
    
    public String getComentario() {
        return comentario;
    }
    
    public void setComentario(String comentario) {
        this.comentario = comentario;
    }
    
    public Campana getCampana() {
        return campana;
    }
    
    public void setCampana(Campana campana) {
        this.campana = campana;
    }
}
