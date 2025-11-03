package com.siscoca.model;

public enum Rol {
    ADMIN("Admin"),
    TRAFFICKER("Trafficker"),
    DUEÑO("Dueño"),
    MKT("Marketing");
    
    private final String displayName;
    
    Rol(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
