import { useAuth } from '../contexts/AuthContext';
import { loggingService, LogEntry, LogFilter, AuditEntity } from '../services/loggingService';

export function useLogging() {
  const { user } = useAuth();

  const log = async (
    accion: string,
    entidad: AuditEntity,
    entidadId?: string,
    detalles?: Record<string, unknown> | Array<unknown> | string | null,
    descripcion?: string
  ) => {
    if (!user) {
      console.warn('No hay usuario autenticado para crear log');
      return;
    }

    const descripcionFinal =
      descripcion ||
      (detalles && typeof detalles === 'object' && !Array.isArray(detalles) && 'descripcion' in detalles
        ? String((detalles as Record<string, unknown>).descripcion)
        : undefined);

    try {
      await loggingService.crearLog({
        entidad,
        accion,
        entidadId,
        descripcion: descripcionFinal,
        detalles,
        usuario: user.username,
        rol: user.rol
      });
    } catch (error) {
      console.error('Error registrando log manual:', error);
    }
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
    return await loggingService.exportLogs(format);
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
