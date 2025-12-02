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

  /**
   * Guarda o actualiza un registro histórico semanal
   * Busca primero si existe un registro para esa campaña y semanaISO
   */
  async guardarHistoricoSemanal(datos: {
    idCampana: string;
    semanaISO: number;
    fechaSemana?: Date | string;
    alcance?: number;
    clics?: number;
    leads?: number;
    costoSemanal?: number;
    costoLead?: number;
    conductoresRegistrados?: number;
    conductoresPrimerViaje?: number;
    costoConductorRegistrado?: number;
    costoConductorPrimerViaje?: number;
    urlInforme?: string;
  }): Promise<any> {
    try {
      // Obtener el usuario actual para el campo registradoPor
      const userStr = localStorage.getItem('siscoca_user');
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const registradoPor = currentUser?.username || 'Usuario';

      // Primero buscar si existe un registro para esta campaña y semanaISO
      const campanaId = parseInt(datos.idCampana);
      const responseBuscar = await fetch(`${API_BASE_URL}/historico/campana/${campanaId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      let historicoExistente: any = null;
      if (responseBuscar.ok) {
        const historicos = await responseBuscar.json();
        historicoExistente = historicos.find((h: any) => h.semanaISO === datos.semanaISO);
      }

      // Preparar el objeto para enviar al backend
      const fechaSemana = datos.fechaSemana 
        ? (typeof datos.fechaSemana === 'string' ? datos.fechaSemana : datos.fechaSemana.toISOString())
        : new Date().toISOString();

      const payload: any = {
        campana: { id: campanaId },
        semanaISO: datos.semanaISO,
        fechaSemana: fechaSemana,
        registradoPor: registradoPor,
      };

      // Agregar métricas solo si tienen valor
      if (datos.alcance !== undefined && datos.alcance !== null) payload.alcance = datos.alcance;
      if (datos.clics !== undefined && datos.clics !== null) payload.clics = datos.clics;
      if (datos.leads !== undefined && datos.leads !== null) payload.leads = datos.leads;
      if (datos.costoSemanal !== undefined && datos.costoSemanal !== null) payload.costoSemanal = datos.costoSemanal;
      if (datos.costoLead !== undefined && datos.costoLead !== null) payload.costoLead = datos.costoLead;
      if (datos.conductoresRegistrados !== undefined && datos.conductoresRegistrados !== null) payload.conductoresRegistrados = datos.conductoresRegistrados;
      if (datos.conductoresPrimerViaje !== undefined && datos.conductoresPrimerViaje !== null) payload.conductoresPrimerViaje = datos.conductoresPrimerViaje;
      if (datos.costoConductorRegistrado !== undefined && datos.costoConductorRegistrado !== null) payload.costoConductorRegistrado = datos.costoConductorRegistrado;
      if (datos.costoConductorPrimerViaje !== undefined && datos.costoConductorPrimerViaje !== null) payload.costoConductorPrimerViaje = datos.costoConductorPrimerViaje;

      let response;
      if (historicoExistente && historicoExistente.id) {
        // Actualizar registro existente
        response = await fetch(`${API_BASE_URL}/historico/${historicoExistente.id}`, {
          method: 'PUT',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        // Crear nuevo registro
        response = await fetch(`${API_BASE_URL}/historico`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || 'Error guardando histórico semanal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error guardando histórico semanal:', error);
      throw error;
    }
  }
}

export const historicoService = new HistoricoService();

