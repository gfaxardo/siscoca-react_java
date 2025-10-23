package com.siscoca.model;

public enum Pais {
    PE("Perú"),
    CO("Colombia");
    
    private final String displayName;
    
    Pais(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static Pais fromDisplayName(String displayName) {
        // Primero intentar por display name
        for (Pais pais : values()) {
            if (pais.displayName.equals(displayName)) {
                return pais;
            }
        }
        // Si no encuentra, intentar por nombre del enum (código)
        try {
            return Pais.valueOf(displayName);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("No enum constant for display name or code: " + displayName);
        }
    }
}
