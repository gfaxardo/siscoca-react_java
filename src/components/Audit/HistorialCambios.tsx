import { useState, useEffect } from 'react';
import { useLogging } from '../../hooks/useLogging';
import { LogEntry, LogFilter } from '../../services/loggingService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorialCambiosProps {
  entidadId?: string;
  onCerrar?: () => void;
}

export default function HistorialCambios({ entidadId, onCerrar }: HistorialCambiosProps) {
  const { getLogs, getLogsByEntity, exportLogs, clearLogs } = useLogging();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filtros, setFiltros] = useState<LogFilter>({});
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarLogs();
  }, [filtros, entidadId]);

  const cargarLogs = () => {
    setCargando(true);
    try {
      const logsData = entidadId 
        ? getLogsByEntity(entidadId)
        : getLogs(filtros);
      setLogs(logsData);
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setCargando(false);
    }
  };

  const manejarFiltro = (campo: keyof LogFilter, valor: any) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor || undefined
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({});
  };

  const manejarExportar = (formato: 'json' | 'csv') => {
    try {
      const data = exportLogs(formato);
      const blob = new Blob([data], { 
        type: formato === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historial_cambios_${format(new Date(), 'yyyy-MM-dd')}.${formato}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exportando logs:', error);
      alert('Error exportando datos');
    }
  };

  const manejarLimpiarLogs = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los logs?\n\nEsta acción no se puede deshacer.')) {
      clearLogs();
      cargarLogs();
    }
  };

  const obtenerColorAccion = (accion: string) => {
    if (accion.includes('Crear') || accion.includes('Agregar')) return 'bg-green-100 text-green-800';
    if (accion.includes('Editar') || accion.includes('Actualizar')) return 'bg-blue-100 text-blue-800';
    if (accion.includes('Eliminar') || accion.includes('Borrar')) return 'bg-red-100 text-red-800';
    if (accion.includes('Archivar')) return 'bg-purple-100 text-purple-800';
    if (accion.includes('Login') || accion.includes('Logout')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const obtenerIconoAccion = (accion: string) => {
    if (accion.includes('Crear') || accion.includes('Agregar')) return '➕';
    if (accion.includes('Editar') || accion.includes('Actualizar')) return '✏️';
    if (accion.includes('Eliminar') || accion.includes('Borrar')) return '🗑️';
    if (accion.includes('Archivar')) return '📁';
    if (accion.includes('Login')) return '🔑';
    if (accion.includes('Logout')) return '🚪';
    if (accion.includes('Subir')) return '📤';
    if (accion.includes('Descargar')) return '📥';
    return '📝';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📋 Historial de Cambios
          </h2>
          <p className="text-gray-600 mt-1">
            {entidadId ? `Logs de la entidad ${entidadId}` : 'Registro de todas las actividades del sistema'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            🔍 Filtros
          </button>
          <button
            onClick={() => manejarExportar('csv')}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-semibold transition-colors"
          >
            📊 Exportar CSV
          </button>
          <button
            onClick={() => manejarExportar('json')}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-semibold transition-colors"
          >
            📄 Exportar JSON
          </button>
          {onCerrar && (
            <button
              onClick={onCerrar}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-colors"
            >
              ❌ Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={filtros.usuario || ''}
                onChange={(e) => manejarFiltro('usuario', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Buscar por usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={filtros.rol || ''}
                onChange={(e) => manejarFiltro('rol', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todos los roles</option>
                <option value="Admin">Admin</option>
                <option value="Trafficker">Trafficker</option>
                <option value="Dueño">Dueño</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Acción</label>
              <input
                type="text"
                value={filtros.accion || ''}
                onChange={(e) => manejarFiltro('accion', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Buscar por acción"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entidad</label>
              <select
                value={filtros.entidad || ''}
                onChange={(e) => manejarFiltro('entidad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las entidades</option>
                <option value="Campaña">Campaña</option>
                <option value="Métricas">Métricas</option>
                <option value="Creativo">Creativo</option>
                <option value="Histórico">Histórico</option>
                <option value="Usuario">Usuario</option>
                <option value="Sistema">Sistema</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={cargarLogs}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Lista de Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {cargando ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Cargando logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay logs disponibles</h3>
            <p className="text-gray-500">No se encontraron registros con los filtros aplicados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acción
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Entidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {format(log.timestamp, 'dd/MM/yyyy', { locale: es })}
                        </div>
                        <div className="text-gray-500">
                          {format(log.timestamp, 'HH:mm:ss', { locale: es })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {log.usuario.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{log.usuario}</div>
                          <div className="text-sm text-gray-500">{log.rol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obtenerColorAccion(log.accion)}`}>
                        <span className="mr-1">{obtenerIconoAccion(log.accion)}</span>
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{log.entidad}</div>
                        <div className="text-gray-500">ID: {log.entidadId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {log.detalles.descripcion && (
                          <div className="mb-2">
                            <span className="font-medium">Descripción:</span>
                            <p className="text-gray-600">{log.detalles.descripcion}</p>
                          </div>
                        )}
                        {log.detalles.cambios && log.detalles.cambios.length > 0 && (
                          <div>
                            <span className="font-medium">Cambios:</span>
                            <ul className="text-gray-600 text-xs mt-1">
                              {log.detalles.cambios.slice(0, 3).map((cambio, index) => (
                                <li key={index} className="truncate">• {cambio}</li>
                              ))}
                              {log.detalles.cambios.length > 3 && (
                                <li className="text-gray-400">... y {log.detalles.cambios.length - 3} más</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer con estadísticas */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Total de registros: {logs.length}</span>
          <div className="flex space-x-4">
            <button
              onClick={manejarLimpiarLogs}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              🗑️ Limpiar Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
