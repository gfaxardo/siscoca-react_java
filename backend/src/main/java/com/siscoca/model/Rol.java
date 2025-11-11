package com.siscoca.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

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
    
    @JsonValue
    public String toJson() {
        return displayName;
    }
    
    @JsonCreator
    public static Rol fromJson(String value) {
        return fromString(value);
    }
    
    public static Rol fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("El rol es obligatorio");
        }
        
        String normalized = normalize(value);
        
        for (Rol rol : values()) {
            if (normalize(rol.displayName).equals(normalized) || rol.name().equalsIgnoreCase(normalized)) {
                return rol;
            }
        }
        
        throw new IllegalArgumentException("No enum constant for display name or code: " + value);
    }
    
    private static String normalize(String value) {
        return Normalizer.normalize(value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace(" ", "_")
                .toUpperCase();
    }
}
