import { API_BASE_URL } from '../config/api';

export interface HistoricoImportPayload {
  campanaIdPlataforma?: string;
  campanaId?: number;
  campanaNombre?: string;
  semanaISO?: number;
  fechaArchivo?: string;
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number;
  costoLead?: number;
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  costoConductorRegistrado?: number;
  costoConductorPrimerViaje?: number;
  estadoActividad?: string;
  estadoMetricas?: string;
  mensaje?: string;
  objetivo?: string;
  beneficio?: string;
  descripcion?: string;
  registradoPor?: string;
  urlInforme?: string;
  pais?: string;
  vertical?: string;
  plataforma?: string;
  segmento?: string;
}

export interface HistoricoImportResponse {
  registrosProcesados: number;
  registrosCreados: number;
  registrosActualizados: number;
  errores: string[];
}

class HistoricoService {
  private getAuthHeaders(): HeadersInit {
    let token: string | null = null;

    const userStr = localStorage.getItem('siscoca_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user?.token || null;
      } catch (error) {
        console.error('Error leyendo token de siscoca_user:', error);
      }
    }

    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async importarHistorico(registros: HistoricoImportPayload[]): Promise<HistoricoImportResponse> {
    const response = await fetch(`${API_BASE_URL}/historico/import`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(registros),
    });

    if (!response.ok) {
      const mensaje = await response.text();
      throw new Error(mensaje || 'Error importando histórico');
    }

    const data = await response.json();
    return {
      registrosProcesados: data.registrosProcesados ?? 0,
      registrosCreados: data.registrosCreados ?? 0,
      registrosActualizados: data.registrosActualizados ?? 0,
      errores: Array.isArray(data.errores) ? data.errores : [],
    };
  }
}

export const historicoService = new HistoricoService();

