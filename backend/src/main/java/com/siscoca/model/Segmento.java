package com.siscoca.model;

public enum Segmento {
    ADQUISICION("Adquisición"),
    RETENCION("Retención"),
    RETORNO("Retorno");
    
    private final String displayName;
    
    Segmento(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
