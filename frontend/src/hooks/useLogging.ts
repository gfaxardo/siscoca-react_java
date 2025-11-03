import { useAuth } from '../contexts/AuthContext';
import { loggingService, LogEntry, LogFilter } from '../services/loggingService';

export function useLogging() {
  const { user } = useAuth();

  const log = async (
    accion: string,
    entidad: LogEntry['entidad'],
    entidadId: string,
    detalles: {
      antes?: any;
      despues?: any;
      descripcion?: string;
    }
  ) => {
    if (!user) {
      console.warn('No hay usuario autenticado para crear log');
      return;
    }

    // Nota: El servicio de logging no tiene método log, se registra automáticamente en el backend
    console.log('Log action:', { accion, entidad, entidadId, detalles });
  };

  const getLogs = async (filter?: LogFilter): Promise<LogEntry[]> => {
    return await loggingService.obtenerLogs(filter);
  };

  const getLogsByEntity = async (entidadId: string): Promise<LogEntry[]> => {
    return await loggingService.obtenerLogsPorEntidad(entidadId);
  };

  const getLogsByUser = async (usuario: string): Promise<LogEntry[]> => {
    return await loggingService.obtenerLogsPorUsuario(usuario);
  };

  const getRecentLogs = async (limit: number = 50): Promise<LogEntry[]> => {
    return await loggingService.obtenerLogsRecientes(limit);
  };

  const getStats = async () => {
    return await loggingService.obtenerEstadisticas();
  };

  const exportLogs = async (format: 'json' | 'csv' = 'json'): Promise<string> => {
    const logs = await loggingService.obtenerLogs();
    if (format === 'csv') {
      const headers = 'Fecha,Usuario,Rol,Acción,Entidad,ID,Descripción\n';
      const rows = logs.map(log => 
        `${log.timestamp},${log.usuario},${log.rol},${log.accion},${log.entidad},${log.entidadId},${log.descripcion || ''}`
      ).join('\n');
      return headers + rows;
    } else {
      return JSON.stringify(logs, null, 2);
    }
  };

  const clearLogs = async () => {
    await loggingService.limpiarLogs();
  };

  return {
    log,
    getLogs,
    getLogsByEntity,
    getLogsByUser,
    getRecentLogs,
    getStats,
    exportLogs,
    clearLogs
  };
}
