package com.siscoca.model;

import java.text.Normalizer;

public enum Segmento {
    ADQUISICION("Adquisición"),
    RETENCION("Retención"),
    RETORNO("Retorno"),
    MAS_VISTAS("Más Vistas"),
    MAS_SEGUIDORES("Más Seguidores"),
    MAS_VISTAS_PERFIL("Más Vistas del Perfil");
    
    private final String displayName;
    
    Segmento(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static Segmento fromDisplayName(String displayName) {
        if (displayName == null || displayName.trim().isEmpty()) {
            throw new IllegalArgumentException("El segmento es obligatorio");
        }
        
        String normalizedInput = normalize(displayName);
        
        for (Segmento segmento : values()) {
            if (normalize(segmento.displayName).equals(normalizedInput)
                    || segmento.name().equalsIgnoreCase(normalizedInput)) {
                return segmento;
            }
        }
        
        throw new IllegalArgumentException("No enum constant for display name or code: " + displayName);
    }
    
    private static String normalize(String value) {
        return Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace(" ", "_")
                .toUpperCase();
    }
}
