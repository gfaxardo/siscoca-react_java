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
}
