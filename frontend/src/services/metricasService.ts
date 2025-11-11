import { MetricasGlobales, MetricaIdeal } from '../types';

import { API_BASE_URL } from '../config/api';

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

  async obtenerMetricasIdeales(filtros: {
    vertical?: string;
    pais?: string;
    plataforma?: string;
    segmento?: string;
  }): Promise<MetricaIdeal[]> {
    const params = new URLSearchParams();
    if (filtros.vertical) params.append('vertical', filtros.vertical);
    if (filtros.pais) params.append('pais', filtros.pais);
    if (filtros.plataforma) params.append('plataforma', filtros.plataforma);
    if (filtros.segmento) params.append('segmento', filtros.segmento);

    const query = params.toString() ? `?${params.toString()}` : '';

    const response = await fetch(`${API_BASE_URL}/metricas-ideales${query}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error obteniendo métricas ideales');
    }

    const data = await response.json();
    return data.map(this.convertirApiAMetrica);
  }

  async guardarMetricasIdeales(metricas: MetricaIdeal[]): Promise<MetricaIdeal[]> {
    const payload = metricas.map((metrica) => {
      const esTemporal = metrica.id.startsWith('temp-');
      return {
        id: esTemporal ? undefined : Number(metrica.id),
        nombre: metrica.nombre,
        valorIdeal: metrica.valorIdeal,
        valorMinimo: metrica.valorMinimo,
        valorMaximo: metrica.valorMaximo,
        unidad: metrica.unidad,
        categoria: metrica.categoria,
        vertical: metrica.vertical,
        pais: metrica.pais,
        plataforma: metrica.plataforma,
        segmento: metrica.segmento,
        activa: metrica.activa,
      };
    });

    const response = await fetch(`${API_BASE_URL}/metricas-ideales/bulk`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Error guardando métricas ideales');
    }

    const data = await response.json();
    return data.map(this.convertirApiAMetrica);
  }

  async eliminarMetricaIdeal(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/metricas-ideales/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error eliminando métrica ideal');
    }
  }

  private convertirApiAMetrica = (data: any): MetricaIdeal => {
    return {
      id: data.id?.toString() ?? `temp-${Date.now()}`,
      nombre: data.nombre ?? '',
      valorIdeal: data.valorIdeal ?? 0,
      valorMinimo: data.valorMinimo ?? 0,
      valorMaximo: data.valorMaximo ?? 0,
      unidad: data.unidad ?? 'USD',
      categoria: data.categoria ?? 'ALCANCE',
      vertical: data.vertical ?? undefined,
      pais: data.pais ?? undefined,
      plataforma: data.plataforma ?? undefined,
      segmento: data.segmento ?? undefined,
      activa: data.activa ?? true,
      fechaCreacion: data.fechaCreacion ? new Date(data.fechaCreacion) : new Date(),
      fechaActualizacion: data.fechaActualizacion ? new Date(data.fechaActualizacion) : new Date(),
    };
  };
}

export const metricasService = new MetricasService();
