// Servicio de campañas con API del backend local
const API_BASE_URL = 'http://localhost:8080/api';

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
  estado: string;
  archivoCreativo?: string;
  nombreArchivoCreativo?: string;
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
  private getAuthHeaders(): Record<string, string> {
    // Obtener el token del usuario almacenado
    const userStr = localStorage.getItem('siscoca_user');
    let token = null;
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user.token;
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async obtenerCampanas(): Promise<CampanaApi[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('siscoca_token');
          localStorage.removeItem('siscoca_user');
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
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
      const response = await fetch(`${API_BASE_URL}/campanas/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(campana),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando campaña:', error);
      throw error;
    }
  }

  async eliminarCampana(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/campanas/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

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
}

export const campanaService = new CampanaService();