package com.siscoca.model;

public enum EstadoCampana {
    PENDIENTE("Pendiente"),
    CREATIVO_ENVIADO("Creativo Enviado"),
    ACTIVA("Activa"),
    ARCHIVADA("Archivada");
    
    private final String displayName;
    
    EstadoCampana(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
