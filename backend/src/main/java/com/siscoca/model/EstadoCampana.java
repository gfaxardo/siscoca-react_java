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
    
    // Método para convertir desde display name o nombre de enum
    public static EstadoCampana fromString(String estado) {
        if (estado == null || estado.trim().isEmpty()) {
            return PENDIENTE; // Estado por defecto
        }
        
        // Primero intentar por nombre de enum (mayúsculas)
        try {
            return EstadoCampana.valueOf(estado.toUpperCase().replace(" ", "_"));
        } catch (IllegalArgumentException e) {
            // Si no funciona, buscar por display name
            for (EstadoCampana estadoEnum : EstadoCampana.values()) {
                if (estadoEnum.getDisplayName().equalsIgnoreCase(estado)) {
                    return estadoEnum;
                }
            }
            // Si no se encuentra, retornar PENDIENTE por defecto
            return PENDIENTE;
        }
    }
}
