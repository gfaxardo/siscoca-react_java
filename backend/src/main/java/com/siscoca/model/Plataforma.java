package com.siscoca.model;

public enum Plataforma {
    FB("Facebook Ads"),
    TT("TikTok Ads"),
    IG("Instagram Ads"),
    GG("Google Ads"),
    LI("LinkedIn Ads");
    
    private final String displayName;
    
    Plataforma(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public static Plataforma fromDisplayName(String displayName) {
        // Primero intentar por display name
        for (Plataforma plataforma : values()) {
            if (plataforma.displayName.equals(displayName)) {
                return plataforma;
            }
        }
        // Si no encuentra, intentar por nombre del enum (código)
        try {
            return Plataforma.valueOf(displayName);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("No enum constant for display name or code: " + displayName);
        }
    }
}
