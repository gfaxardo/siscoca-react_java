package com.siscoca.model;

public enum TipoTarea {
    CREAR_CAMPANA("Crear Campaña", Rol.DUEÑO, null), // DUEÑO o MKT pueden crear
    ENVIAR_CREATIVO("Enviar Creativo", Rol.MKT, EstadoCampana.PENDIENTE),
    ACTIVAR_CAMPANA("Activar Campaña", Rol.MKT, EstadoCampana.CREATIVO_ENVIADO),
    SUBIR_METRICAS_TRAFFICKER("Subir Métricas Trafficker", Rol.TRAFFICKER, EstadoCampana.ACTIVA),
    SUBIR_METRICAS_DUENO("Subir Métricas Dueño", Rol.DUEÑO, EstadoCampana.ACTIVA),
    ARCHIVAR_CAMPANA("Archivar Campaña", Rol.DUEÑO, EstadoCampana.ACTIVA);
    
    private final String displayName;
    private final Rol responsable;
    private final EstadoCampana estadoCampana;
    
    TipoTarea(String displayName, Rol responsable, EstadoCampana estadoCampana) {
        this.displayName = displayName;
        this.responsable = responsable;
        this.estadoCampana = estadoCampana;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public Rol getResponsable() {
        return responsable;
    }
    
    public EstadoCampana getEstadoCampana() {
        return estadoCampana;
    }
}

