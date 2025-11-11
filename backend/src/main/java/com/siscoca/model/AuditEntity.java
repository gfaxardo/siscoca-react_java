package com.siscoca.model;

/**
 * Modulos estándar utilizados para el registro de auditoría.
 */
public enum AuditEntity {
    CAMPANAS("Campaña"),
    CREATIVOS("Creativo"),
    METRICAS("Métricas"),
    TAREAS("Tarea"),
    USUARIOS("Usuario"),
    CHAT("Chat"),
    AUTH("Auth"),
    SISTEMA("Sistema");

    private final String displayName;

    AuditEntity(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}

