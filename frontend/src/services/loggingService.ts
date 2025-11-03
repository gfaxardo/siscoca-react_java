// Servicio de logging y auditoría con API del backend local
// El backend tiene context-path: /api, por lo que la URL debe incluir /api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface LogEntry {
  id: number;
  timestamp: string;
  usuario: string;
  rol: string;
  accion: string;
  entidad: string;
  entidadId: string;
  descripcion?: string;
  detalles?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
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

class LoggingService {
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Solo agregar Authorization si hay un token válido
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
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

      const response = await fetch(`${API_BASE_URL}/logging?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo logs:', error);
      throw error;
    }
  }

  async obtenerLogsPorEntidad(entidadId: string): Promise<LogEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/entidad/${entidadId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo logs por entidad:', error);
      throw error;
    }
  }

  async obtenerLogsPorUsuario(usuario: string): Promise<LogEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/usuario/${usuario}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo logs por usuario:', error);
      throw error;
    }
  }

  async obtenerLogsRecientes(limite: number = 50): Promise<LogEntry[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/recientes?limite=${limite}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo logs recientes:', error);
      throw error;
    }
  }

  async obtenerEstadisticas(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging/estadisticas`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
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

  async limpiarLogs(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/logging`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error limpiando logs:', error);
      throw error;
    }
  }
}

export const loggingService = new LoggingService();
