import { useState, useEffect } from 'react';
import { useLogging } from '../../hooks/useLogging';
import { LogEntry, LogFilter } from '../../services/loggingService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileText, 
  Filter, 
  Download, 
  X, 
  User, 
  Clock, 
  PlusCircle, 
  Edit, 
  Trash2, 
  Archive, 
  LogIn, 
  LogOut, 
  Upload, 
  Calendar,
  Loader2,
  RefreshCw,
  Shield
} from 'lucide-react';

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

  const cargarLogs = async () => {
    setCargando(true);
    try {
      const logsData = entidadId 
        ? await getLogsByEntity(entidadId)
        : await getLogs(filtros);
      setLogs(logsData);
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: Date | null, formato: string) => {
    if (!fecha) return '—';
    // El backend envía LocalDateTime sin zona horaria, que JavaScript interpreta como hora local
    // Pero si el servidor está en una zona horaria diferente, puede haber desajuste
    // Asumimos que el backend envía la hora en la zona horaria del servidor
    // y la mostramos tal cual (sin conversión adicional)
    return format(fecha, formato, { locale: es });
  };

  const renderDetalles = (detalles: LogEntry['detalles']) => {
    if (!detalles) {
      return <span className="text-gray-500">Sin detalles</span>;
    }

    if (typeof detalles === 'string') {
      return <p className="text-gray-600">{detalles}</p>;
    }

    if (Array.isArray(detalles)) {
      return (
        <ul className="text-gray-600 text-xs space-y-1">
          {detalles.slice(0, 5).map((item, idx) => (
            <li key={idx} className="truncate">• {JSON.stringify(item)}</li>
          ))}
          {detalles.length > 5 && (
            <li className="text-gray-400">... y {detalles.length - 5} más</li>
          )}
        </ul>
      );
    }

    if (typeof detalles === 'object') {
      const detallesObj = detalles as Record<string, unknown>;
      const tieneAntesDespues = 'antes' in detallesObj || 'despues' in detallesObj;
      const descripcionValor = 'descripcion' in detallesObj ? detallesObj.descripcion : undefined;
      const descripcionTexto =
        descripcionValor === undefined || descripcionValor === null
          ? undefined
          : String(descripcionValor);

      return (
        <div className="space-y-2">
          {descripcionTexto && (
            <p className="text-gray-600">{descripcionTexto}</p>
          )}
          {tieneAntesDespues && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {'antes' in detallesObj && (
                <div>
                  <span className="font-semibold text-gray-700">Antes</span>
                  <pre className="bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto">
                    {JSON.stringify(detallesObj.antes, null, 2)}
                  </pre>
                </div>
              )}
              {'despues' in detallesObj && (
                <div>
                  <span className="font-semibold text-gray-700">Después</span>
                  <pre className="bg-gray-50 border border-gray-200 rounded p-2 overflow-x-auto">
                    {JSON.stringify(detallesObj.despues, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer select-none">Ver JSON completo</summary>
            <pre className="bg-gray-50 border border-gray-200 rounded p-2 mt-2 overflow-x-auto">
              {JSON.stringify(detallesObj, null, 2)}
            </pre>
          </details>
        </div>
      );
    }

    return <span>{String(detalles)}</span>;
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

  const manejarExportar = async (formato: 'json' | 'csv') => {
    try {
      const data = await exportLogs(formato);
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

  const manejarLimpiarLogs = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los logs?\n\nEsta acción no se puede deshacer.')) {
      await clearLogs();
      await cargarLogs();
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
    if (accion.includes('Crear') || accion.includes('Agregar')) return <PlusCircle className="w-3.5 h-3.5" />;
    if (accion.includes('Editar') || accion.includes('Actualizar')) return <Edit className="w-3.5 h-3.5" />;
    if (accion.includes('Eliminar') || accion.includes('Borrar')) return <Trash2 className="w-3.5 h-3.5" />;
    if (accion.includes('Archivar')) return <Archive className="w-3.5 h-3.5" />;
    if (accion.includes('Login')) return <LogIn className="w-3.5 h-3.5" />;
    if (accion.includes('Logout')) return <LogOut className="w-3.5 h-3.5" />;
    if (accion.includes('Subir')) return <Upload className="w-3.5 h-3.5" />;
    if (accion.includes('Descargar')) return <Download className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header moderno con estadísticas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Auditoría del Sistema
              </h1>
              <p className="text-gray-400 text-sm lg:text-base font-medium">
                {logs.length} registro{logs.length !== 1 ? 's' : ''} de actividad
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all duration-200 shadow hover:shadow-md flex items-center gap-2 border border-white/20"
            >
              <Filter className="w-4 h-4" />
              {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
            <button
              onClick={() => manejarExportar('csv')}
              className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-200 shadow hover:shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => manejarExportar('json')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-200 shadow hover:shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              JSON
            </button>
            {onCerrar && (
              <button
                onClick={onCerrar}
                className="px-5 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow hover:shadow-md flex items-center gap-2"
                style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
              >
                <X className="w-4 h-4" />
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros */}
      {mostrarFiltros && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: '#ef0000' }} />
            Filtros de Búsqueda
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                Usuario
              </label>
              <input
                type="text"
                value={filtros.usuario || ''}
                onChange={(e) => manejarFiltro('usuario', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-medium hover:border-gray-400"
                placeholder="Buscar por usuario"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" style={{ color: '#ef0000' }} />
                Rol
              </label>
              <select
                value={filtros.rol || ''}
                onChange={(e) => manejarFiltro('rol', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-medium bg-white hover:border-gray-400"
              >
                <option value="">Todos los roles</option>
                <option value="Admin">Admin</option>
                <option value="Trafficker">Trafficker</option>
                <option value="Dueño">Dueño</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                Acción
              </label>
              <input
                type="text"
                value={filtros.accion || ''}
                onChange={(e) => manejarFiltro('accion', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-medium hover:border-gray-400"
                placeholder="Buscar por acción"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Archive className="w-4 h-4" style={{ color: '#ef0000' }} />
                Entidad
              </label>
              <select
                value={filtros.entidad || ''}
                onChange={(e) => manejarFiltro('entidad', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-medium bg-white hover:border-gray-400"
              >
                <option value="">Todas las entidades</option>
                <option value="Campaña">Campaña</option>
                <option value="Creativo">Creativo</option>
                <option value="Métricas">Métricas</option>
                <option value="Tarea">Tarea</option>
                <option value="Usuario">Usuario</option>
                <option value="Chat">Chat</option>
                <option value="Auth">Auth</option>
                <option value="Sistema">Sistema</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-6 gap-3">
            <button
              onClick={limpiarFiltros}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 shadow hover:shadow-md flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
            <button
              onClick={cargarLogs}
              className="px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              <RefreshCw className="w-4 h-4" />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Lista de Logs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-900 mb-2">Cargando registros...</p>
            <p className="text-sm text-gray-600">Por favor espera un momento</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center">
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #6b7280, #4b5563)' }}
            >
              <FileText className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No hay logs disponibles</h3>
            <p className="text-gray-600 text-base font-medium">No se encontraron registros con los filtros aplicados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Fecha/Hora
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Usuario
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Acción
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Archive className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Entidad
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Detalles
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-bold text-gray-900">
                            {formatearFecha(log.timestamp, 'dd/MM/yyyy')}
                          </div>
                          <div className="text-gray-500 font-medium">
                            {formatearFecha(log.timestamp, 'HH:mm:ss')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div 
                            className="h-10 w-10 rounded-full flex items-center justify-center shadow-md"
                            style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
                          >
                            <span className="text-sm font-bold text-white">
                              {log.usuario.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-bold text-gray-900">{log.usuario}</div>
                          <div className="text-sm text-gray-600 font-medium">{log.rol}</div>
                          {log.ipAddress && (
                            <div className="text-xs text-gray-500 font-medium">IP: {log.ipAddress}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${obtenerColorAccion(log.accion)}`}>
                        {obtenerIconoAccion(log.accion)}
                        {log.accion}
                      </span>
                      {log.descripcion && (
                        <div className="text-xs text-gray-600 mt-2 font-medium">{log.descripcion}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-bold text-gray-900">{log.entidad}</div>
                        {log.entidadId && (
                          <div className="text-gray-600 text-xs font-medium">ID: {log.entidadId}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="max-w-xs">
                        {renderDetalles(log.detalles)}
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
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Total de registros</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={cargarLogs}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar
            </button>
            <button
              onClick={manejarLimpiarLogs}
              className="px-6 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              <Trash2 className="w-4 h-4" />
              Limpiar Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
