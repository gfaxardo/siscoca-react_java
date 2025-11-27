// Importar authService para recuperar el token si es necesario
import { authService } from './authService';

// Servicio de campañas con API del backend local
// El backend tiene context-path: /api, por lo que la URL debe incluir /api
import { API_BASE_URL } from '../config/api';

export interface CampanaApi {
  id: number;
  nombre: string;
  pais: string;
  vertical: string;
  plataforma: string;
  segmento: string;
  idPlataformaExterna?: string;
  nombreDueno: string;
  inicialesDueno: string;
  descripcionCorta: string;
  objetivo: string;
  beneficio: string;
  descripcion: string;
  tipoAterrizaje?: string;
  urlAterrizaje?: string;
  nombrePlataforma?: string;
  estado: string;
  archivoCreativo?: string;
  nombreArchivoCreativo?: string;
  urlCreativoExterno?: string;
  urlInforme?: string;
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number; // en USD
  costoLead?: number; // en USD
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  costoConductorRegistrado?: number; // en USD
  costoConductorPrimerViaje?: number; // en USD
  costoConductor?: number; // en USD
  fechaCreacion: string;
  fechaActualizacion: string;
  semanaISO: number;
}

export interface MetricasTraffickerApi {
  idCampana: number;
  urlInforme?: string;
  alcance: number;
  clics: number;
  leads: number;
  costoSemanal: number; // en USD
  costoLead?: number; // en USD
}

export interface MetricasDuenoApi {
  idCampana: number;
  conductoresRegistrados: number;
  conductoresPrimerViaje: number;
}

class CampanaService {
  /**
   * Maneja errores de autenticación (401/403) limpiando el localStorage y lanzando el error apropiado
   */
  private async handleAuthError(response: Response): Promise<never> {
    // Limpiar datos de autenticación
    localStorage.removeItem('siscoca_user');
    localStorage.removeItem('siscoca_token');
    localStorage.removeItem('token');
    
    // Intentar obtener mensaje de error del backend
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Sesión expirada. Por favor, inicia sesión nuevamente.');
    } catch (parseError) {
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }
  }

  private getAuthHeaders(): Record<string, string> {
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
    
    // 3. Intentar obtener desde authService si está disponible
    if (!token) {
      try {
        // Verificar si existe el método getToken en window (si está disponible globalmente)
        // O simplemente verificar si hay algún token guardado en otras claves
        const possibleTokenKeys = ['auth_token', 'jwt_token', 'access_token'];
        for (const key of possibleTokenKeys) {
          const possibleToken = localStorage.getItem(key);
          if (possibleToken && possibleToken !== 'null' && possibleToken !== 'undefined' && possibleToken.trim() !== '') {
            token = possibleToken;
            break;
          }
        }
      } catch (error) {
        // Si falla, no hacer nada
      }
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Solo agregar Authorization si hay un token válido
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Último intento: obtener desde authService directamente
      try {
        const lastToken = authService.getToken();
        if (lastToken && lastToken !== 'null' && lastToken.trim() !== '') {
          token = lastToken;
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('  - Error obteniendo token desde authService:', error);
      }
      
      if (!headers['Authorization']) {
        console.error('⚠️ La petición se enviará SIN token. Fallará con 403.');
      }
    }
    
    return headers;
  }

  async obtenerCampanas(): Promise<CampanaApi[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // Si es error 401 o 403, probablemente el token expiró
        if (response.status === 401 || response.status === 403) {
          await this.handleAuthError(response);
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo campañas:', error);
      throw error;
    }
  }

  async obtenerCampanaPorId(id: number): Promise<CampanaApi | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        if (response.status === 401 || response.status === 403) {
          await this.handleAuthError(response);
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo campaña:', error);
      throw error;
    }
  }

  async crearCampana(campana: Omit<CampanaApi, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'semanaISO'>): Promise<CampanaApi> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(campana),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creando campaña:', error);
      throw error;
    }
  }

  async actualizarCampana(id: number, campana: Partial<CampanaApi>): Promise<CampanaApi> {
    try {
      const headers = this.getAuthHeaders();
      
      // Verificar que hay token antes de hacer la petición
      if (!headers['Authorization']) {
        throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
      }
      
      // Asegurar que Content-Type esté presente
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      
      const response = await fetch(`${API_BASE_URL}/campanas/update/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(campana),
      });

      if (!response.ok) {
        // Si es error 401 o 403, probablemente el token expiró
        if (response.status === 401 || response.status === 403) {
          await this.handleAuthError(response);
        }
        
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando campaña:', error);
      
      // Mejorar mensaje de error para "Failed to fetch"
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('No se pudo conectar con el servidor. Verifica que el backend esté corriendo y que la URL sea correcta.');
      }
      
      throw error;
    }
  }

  async eliminarCampana(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await this.handleAuthError(response);
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return response.ok;
    } catch (error) {
      console.error('Error eliminando campaña:', error);
      throw error;
    }
  }

  async obtenerCampanasPorEstado(estado: string): Promise<CampanaApi[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas/estado/${estado}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo campañas por estado:', error);
      throw error;
    }
  }

  async obtenerCampanasPorDueno(nombreDueno: string): Promise<CampanaApi[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas/dueno/${encodeURIComponent(nombreDueno)}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo campañas por dueño:', error);
      throw error;
    }
  }

  async actualizarMetricasTrafficker(metricas: MetricasTraffickerApi): Promise<CampanaApi> {
    try {
      const campana = await this.obtenerCampanaPorId(metricas.idCampana);
      if (!campana) {
        throw new Error('Campaña no encontrada');
      }

      const campanaActualizada = {
        ...campana,
        urlInforme: metricas.urlInforme,
        alcance: metricas.alcance,
        clics: metricas.clics,
        leads: metricas.leads,
        costoSemanal: metricas.costoSemanal,
        costoLead: metricas.costoLead,
      };

      return await this.actualizarCampana(metricas.idCampana, campanaActualizada);
    } catch (error) {
      console.error('Error actualizando métricas del trafficker:', error);
      throw error;
    }
  }

  async actualizarMetricasDueno(metricas: MetricasDuenoApi): Promise<CampanaApi> {
    try {
      const campana = await this.obtenerCampanaPorId(metricas.idCampana);
      if (!campana) {
        throw new Error('Campaña no encontrada');
      }

      const campanaActualizada = {
        ...campana,
        conductoresRegistrados: metricas.conductoresRegistrados,
        conductoresPrimerViaje: metricas.conductoresPrimerViaje,
      };

      return await this.actualizarCampana(metricas.idCampana, campanaActualizada);
    } catch (error) {
      console.error('Error actualizando métricas del dueño:', error);
      throw error;
    }
  }

  async cambiarEstadoCampana(id: number, nuevoEstado: string): Promise<CampanaApi> {
    try {
      return await this.actualizarCampana(id, { estado: nuevoEstado });
    } catch (error) {
      console.error('Error cambiando estado de campaña:', error);
      throw error;
    }
  }

  async archivarCampana(id: number): Promise<CampanaApi> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas/${id}/archivar`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await this.handleAuthError(response);
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error archivando campaña:', error);
      throw error;
    }
  }

  async reactivarCampana(id: number): Promise<CampanaApi> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas/${id}/reactivar`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await this.handleAuthError(response);
        }
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error reactivando campaña:', error);
      throw error;
    }
  }
}

export const campanaService = new CampanaService();