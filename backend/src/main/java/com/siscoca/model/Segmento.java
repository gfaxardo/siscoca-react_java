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
    
    public static Segmento fromDisplayName(String displayName) {
        // Primero intentar por display name
        for (Segmento segmento : values()) {
            if (segmento.displayName.equals(displayName)) {
                return segmento;
            }
        }
        // Si no encuentra, intentar por nombre del enum (código)
        try {
            return Segmento.valueOf(displayName);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("No enum constant for display name or code: " + displayName);
        }
    }
}
