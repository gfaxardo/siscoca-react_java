import { MetricasGlobales } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apisiscoca.yego.pro/api';

class MetricasService {
  private getAuthHeaders(): HeadersInit {
    let token: string | null = null;
    
    // 1. Intentar obtener desde 'siscoca_user' (formato principal)
    const userStr = localStorage.getItem('siscoca_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user?.token || null;
        
        // Verificar que el token no esté vacío
        if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
          token = null;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    
    // 2. Si no hay token, intentar obtenerlo directamente del localStorage
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
      
      // Verificar que el token no sea inválido
      if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
        token = null;
      }
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Solo agregar Authorization si hay un token válido
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async obtenerMetricasGlobales(idCampana: string): Promise<MetricasGlobales | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/metricas/campana/${idCampana}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error obteniendo métricas globales');
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo métricas globales:', error);
      throw error;
    }
  }
}

export const metricasService = new MetricasService();
