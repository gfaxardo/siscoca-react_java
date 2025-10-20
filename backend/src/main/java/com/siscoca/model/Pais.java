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
}
