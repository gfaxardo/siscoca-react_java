package com.siscoca.dto;

import java.util.ArrayList;
import java.util.List;

public class HistoricoImportResponseDto {
    
    private int registrosProcesados;
    private int registrosCreados;
    private int registrosActualizados;
    private List<String> errores = new ArrayList<>();
    
    public int getRegistrosProcesados() {
        return registrosProcesados;
    }
    
    public void setRegistrosProcesados(int registrosProcesados) {
        this.registrosProcesados = registrosProcesados;
    }
    
    public int getRegistrosCreados() {
        return registrosCreados;
    }
    
    public void setRegistrosCreados(int registrosCreados) {
        this.registrosCreados = registrosCreados;
    }
    
    public int getRegistrosActualizados() {
        return registrosActualizados;
    }
    
    public void setRegistrosActualizados(int registrosActualizados) {
        this.registrosActualizados = registrosActualizados;
    }
    
    public List<String> getErrores() {
        return errores;
    }
    
    public void setErrores(List<String> errores) {
        this.errores = errores;
    }
    
    public void addError(String mensaje) {
        this.errores.add(mensaje);
    }
}

