package com.siscoca.model;

public enum Rol {
    ADMIN("Admin"),
    TRAFFICKER("Trafficker"),
    DUEÑO("Dueño");
    
    private final String displayName;
    
    Rol(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
