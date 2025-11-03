package com.siscoca.model;

public enum TipoCambio {
    CREACION("Creación"),
    EDICION("Edición"),
    METRICAS("Métricas"),
    ESTADO("Estado"),
    ARCHIVADO("Archivado");
    
    private final String displayName;
    
    TipoCambio(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
