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
}
