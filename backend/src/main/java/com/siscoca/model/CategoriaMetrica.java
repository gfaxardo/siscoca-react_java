package com.siscoca.model;

public enum CategoriaMetrica {
    ALCANCE("Alcance"),
    LEADS("Leads"),
    COSTO("Costo"),
    CONDUCTORES("Conductores"),
    CONVERSION("Conversión");
    
    private final String displayName;
    
    CategoriaMetrica(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
