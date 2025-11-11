// Servicio de logging y auditoría con API del backend local
// El backend tiene context-path: /api, por lo que la URL debe incluir /api
import { API_BASE_URL } from '../config/api';

export type AuditEntity =
  | 'CAMPANAS'
  | 'CREATIVOS'
  | 'METRICAS'
  | 'TAREAS'
  | 'USUARIOS'
  | 'CHAT'
  | 'AUTH'
  | 'SISTEMA';

export interface LogEntry {
  id: number;
  timestamp: Date | null;
  usuario: string;
  rol: string;
  accion: string;
  entidad: string;
  entidadId: string | null;
  descripcion?: string | null;
  detalles?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  sessionId?: string | null;
}

export interface LogFilter {
  usuario?: string;
  rol?: string;
  accion?: string;
  entidad?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  entidadId?: string;
}

export interface CreateLogPayload {
  entidad: AuditEntity;
  accion: string;
  entidadId?: string;
  descripcion?: string;
  detalles?: unknown;
  usuario?: string;
  rol?: string;
}

class LoggingService {
  private getAuthHeaders(): Record<string, string> {
    let token: string | null = null;

    const userStr = localStorage.getItem('siscoca_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user?.token || null;
        if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
          token = null;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }

    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
      if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
        token = null;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async obtenerLogs(filter?: LogFilter): Promise<LogEntry[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.usuario) params.append('usuario', filter.usuario);
      if (filter?.rol) params.append('rol', filter.rol);
      if (filter?.accion) params.append('accion', filter.accion);
      if (filter?.entidad) params.append('entidad', filter.entidad);
      if (filter?.entidadId) params.append('entidadId', filter.entidadId);
      if (filter?.fechaDesde) params.append('fechaDesde', filter.fechaDesde.toISOString());
      if (filter?.fechaHasta) params.append('fechaHasta', filter.fechaHasta.toISOString());

      const response = await fetch(`${API_BASE_URL}/logging?${params.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(this.parseLogEntry) : [];
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      throw error;
    }
  }

  async obtenerLogsPorEntidad(entidadId: string): Promise<LogEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/entidad/${entidadId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(this.parseLogEntry) : [];
    } catch (error) {
      console.error('Error obteniendo logs por entidad:', error);
      throw error;
    }
  }

  async obtenerLogsPorUsuario(usuario: string): Promise<LogEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/usuario/${usuario}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(this.parseLogEntry) : [];
    } catch (error) {
      console.error('Error obteniendo logs por usuario:', error);
      throw error;
    }
  }

  async obtenerLogsRecientes(limite: number = 50): Promise<LogEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/recientes?limite=${limite}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data.map(this.parseLogEntry) : [];
    } catch (error) {
      console.error('Error obteniendo logs recientes:', error);
      throw error;
    }
  }

  async obtenerEstadisticas(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/estadisticas`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    const logs = await this.obtenerLogs();
    if (format === 'csv') {
      const headers = 'Fecha,Usuario,Rol,Acción,Entidad,ID,Descripción\n';
      const rows = logs
        .map((log) => {
          const fecha = log.timestamp ? log.timestamp.toISOString() : '';
          const entidadId = log.entidadId ?? '';
          const descripcion = (log.descripcion ?? '').replace(/"/g, '""');
          return `${fecha},${log.usuario},${log.rol},${log.accion},${log.entidad},${entidadId},"${descripcion}"`;
        })
        .join('\n');
      return headers + rows;
    }

    return JSON.stringify(logs, null, 2);
  }

  async limpiarLogs(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error limpiando logs:', error);
      throw error;
    }
  }

  async crearLog(payload: CreateLogPayload): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error creando log manualmente:', error);
      throw error;
    }
  }

  private parseLogEntry = (raw: any): LogEntry => {
    let detalles: unknown = raw.detalles ?? null;
    if (detalles && typeof detalles === 'string') {
      try {
        detalles = JSON.parse(detalles);
      } catch {
        // Mantener string original si no es JSON válido
      }
    }

    let timestamp: Date | null = null;
    if (raw.timestamp) {
      const parsed = new Date(raw.timestamp);
      if (!Number.isNaN(parsed.getTime())) {
        timestamp = parsed;
      }
    }

    return {
      id: raw.id,
      timestamp,
      usuario: raw.usuario,
      rol: raw.rol,
      accion: raw.accion,
      entidad: raw.entidad,
      entidadId: raw.entidadId ?? null,
      descripcion: raw.descripcion ?? null,
      detalles,
      ipAddress: raw.ipAddress ?? null,
      userAgent: raw.userAgent ?? null,
      sessionId: raw.sessionId ?? null
    };
  };
}

export const loggingService = new LoggingService();
