package com.siscoca.model;

public enum TipoAterrizaje {
    FORMS("Formulario de Registro"),
    WHATSAPP("WhatsApp Business"),
    URL("URL Externa"),
    LANDING("Landing Page"),
    APP("Aplicación Móvil"),
    CALL_CENTER("Call Center"),
    EMAIL("Correo Electrónico"),
    OTRO("Otro");
    
    private final String descripcion;
    
    TipoAterrizaje(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
}
