package com.siscoca.model;

public enum Vertical {
    MOTOPER("Moto Persona"),
    MOTODEL("Moto Delivery"),
    CARGO("Cargo"),
    AUTOPER("Auto Persona"),
    B2B("B2B"),
    PREMIER("Premier"),
    CONFORT("Confort"),
    YEGOPRO("YegoPro"),
    YEGOMIAUTO("YegoMiAuto"),
    YEGOMIMOTO("YegoMiMoto");
    
    private final String displayName;
    
    Vertical(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static Vertical fromDisplayName(String displayName) {
        // Primero intentar por display name
        for (Vertical vertical : values()) {
            if (vertical.displayName.equals(displayName)) {
                return vertical;
            }
        }
        // Si no encuentra, intentar por nombre del enum (código)
        try {
            return Vertical.valueOf(displayName);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("No enum constant for display name or code: " + displayName);
        }
    }
}
