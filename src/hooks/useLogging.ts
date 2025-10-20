import { useAuth } from '../contexts/AuthContext';
import { loggingService, LogEntry, LogFilter } from '../services/loggingService';

export function useLogging() {
  const { user } = useAuth();

  const log = (
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

    loggingService.log(
      user.username,
      user.rol,
      accion,
      entidad,
      entidadId,
      detalles
    );
  };

  const getLogs = (filter?: LogFilter): LogEntry[] => {
    return loggingService.getLogs(filter);
  };

  const getLogsByEntity = (entidadId: string): LogEntry[] => {
    return loggingService.getLogsByEntity(entidadId);
  };

  const getLogsByUser = (usuario: string): LogEntry[] => {
    return loggingService.getLogsByUser(usuario);
  };

  const getRecentLogs = (limit: number = 50): LogEntry[] => {
    return loggingService.getRecentLogs(limit);
  };

  const getStats = () => {
    return loggingService.getStats();
  };

  const exportLogs = (format: 'json' | 'csv' = 'json'): string => {
    return loggingService.exportLogs(format);
  };

  const clearLogs = () => {
    loggingService.clearLogs();
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
