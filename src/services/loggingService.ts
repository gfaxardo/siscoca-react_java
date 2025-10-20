// Servicio de logging y auditoría
export interface LogEntry {
  id: string;
  timestamp: Date;
  usuario: string;
  rol: 'Admin' | 'Trafficker' | 'Dueño';
  accion: string;
  entidad: 'Campaña' | 'Métricas' | 'Creativo' | 'Histórico' | 'Usuario' | 'Sistema';
  entidadId: string;
  detalles: {
    antes?: any;
    despues?: any;
    cambios?: string[];
    descripcion?: string;
  };
  ip?: string;
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
  private readonly STORAGE_KEY = 'siscoca_logs';
  private logs: LogEntry[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error cargando logs:', error);
      this.logs = [];
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error guardando logs:', error);
    }
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientInfo() {
    return {
      ip: '127.0.0.1', // En producción, obtener IP real
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId()
    };
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('siscoca_session');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('siscoca_session', sessionId);
    }
    return sessionId;
  }

  private calculateChanges(antes: any, despues: any): string[] {
    if (!antes || !despues) return [];

    const changes: string[] = [];
    const keys = new Set([...Object.keys(antes || {}), ...Object.keys(despues || {})]);

    for (const key of keys) {
      const valorAntes = antes?.[key];
      const valorDespues = despues?.[key];

      if (valorAntes !== valorDespues) {
        changes.push(`${key}: "${valorAntes}" → "${valorDespues}"`);
      }
    }

    return changes;
  }

  log(
    usuario: string,
    rol: 'Admin' | 'Trafficker' | 'Dueño',
    accion: string,
    entidad: LogEntry['entidad'],
    entidadId: string,
    detalles: {
      antes?: any;
      despues?: any;
      descripcion?: string;
    }
  ): void {
    try {
      const clientInfo = this.getClientInfo();
      const cambios = this.calculateChanges(detalles.antes, detalles.despues);

      const logEntry: LogEntry = {
        id: this.generateId(),
        timestamp: new Date(),
        usuario,
        rol,
        accion,
        entidad,
        entidadId,
        detalles: {
          ...detalles,
          cambios
        },
        ...clientInfo
      };

      this.logs.unshift(logEntry); // Agregar al inicio
      
      // Mantener solo los últimos 1000 logs para evitar problemas de memoria
      if (this.logs.length > 1000) {
        this.logs = this.logs.slice(0, 1000);
      }

      this.saveLogs();
    } catch (error) {
      console.error('Error creando log:', error);
    }
  }

  getLogs(filter?: LogFilter): LogEntry[] {
    let filteredLogs = [...this.logs];

    if (!filter) return filteredLogs;

    if (filter.usuario) {
      filteredLogs = filteredLogs.filter(log => 
        log.usuario.toLowerCase().includes(filter.usuario!.toLowerCase())
      );
    }

    if (filter.rol) {
      filteredLogs = filteredLogs.filter(log => log.rol === filter.rol);
    }

    if (filter.accion) {
      filteredLogs = filteredLogs.filter(log => 
        log.accion.toLowerCase().includes(filter.accion!.toLowerCase())
      );
    }

    if (filter.entidad) {
      filteredLogs = filteredLogs.filter(log => log.entidad === filter.entidad);
    }

    if (filter.entidadId) {
      filteredLogs = filteredLogs.filter(log => log.entidadId === filter.entidadId);
    }

    if (filter.fechaDesde) {
      filteredLogs = filteredLogs.filter(log => 
        log.timestamp >= filter.fechaDesde!
      );
    }

    if (filter.fechaHasta) {
      filteredLogs = filteredLogs.filter(log => 
        log.timestamp <= filter.fechaHasta!
      );
    }

    return filteredLogs;
  }

  getLogsByEntity(entidadId: string): LogEntry[] {
    return this.logs.filter(log => log.entidadId === entidadId);
  }

  getLogsByUser(usuario: string): LogEntry[] {
    return this.logs.filter(log => log.usuario === usuario);
  }

  getRecentLogs(limit: number = 50): LogEntry[] {
    return this.logs.slice(0, limit);
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Usuario', 'Rol', 'Acción', 'Entidad', 'Entidad ID', 'Descripción', 'Cambios'];
      const rows = this.logs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        log.usuario,
        log.rol,
        log.accion,
        log.entidad,
        log.entidadId,
        log.detalles.descripcion || '',
        log.detalles.cambios?.join('; ') || ''
      ]);

      return [headers, ...rows].map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }

  getStats(): {
    totalLogs: number;
    logsByUser: Record<string, number>;
    logsByAction: Record<string, number>;
    logsByEntity: Record<string, number>;
    recentActivity: LogEntry[];
  } {
    const logsByUser: Record<string, number> = {};
    const logsByAction: Record<string, number> = {};
    const logsByEntity: Record<string, number> = {};

    this.logs.forEach(log => {
      logsByUser[log.usuario] = (logsByUser[log.usuario] || 0) + 1;
      logsByAction[log.accion] = (logsByAction[log.accion] || 0) + 1;
      logsByEntity[log.entidad] = (logsByEntity[log.entidad] || 0) + 1;
    });

    return {
      totalLogs: this.logs.length,
      logsByUser,
      logsByAction,
      logsByEntity,
      recentActivity: this.getRecentLogs(10)
    };
  }
}

export const loggingService = new LoggingService();
