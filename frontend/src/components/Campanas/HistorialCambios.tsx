import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { HistorialCambio, Campana } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useLogging } from '../../hooks/useLogging';
import { LogEntry } from '../../services/loggingService';
import { 
  History, 
  X, 
  PlusCircle, 
  Edit3, 
  BarChart3, 
  RefreshCw, 
  Archive, 
  Loader2, 
  AlertCircle, 
  Filter, 
  User, 
  Calendar, 
  FileText,
  ArrowRight
} from 'lucide-react';

interface HistorialCambiosProps {
  campana: Campana;
  onCerrar: () => void;
}

const TIPOS_CAMBIO_LABELS: Record<HistorialCambio['tipoCambio'], string> = {
  CREACION: 'Creación',
  EDICION: 'Edición',
  METRICAS: 'Métricas',
  ESTADO: 'Estado',
  ARCHIVADO: 'Archivado'
};

const TIPOS_CAMBIO_COLORS: Record<HistorialCambio['tipoCambio'], string> = {
  CREACION: 'bg-green-100 text-green-800',
  EDICION: 'bg-blue-100 text-blue-800',
  METRICAS: 'bg-purple-100 text-purple-800',
  ESTADO: 'bg-yellow-100 text-yellow-800',
  ARCHIVADO: 'bg-gray-100 text-gray-800'
};

const TIPOS_CAMBIO_ICONS: Record<HistorialCambio['tipoCambio'], JSX.Element> = {
  CREACION: <PlusCircle className="w-5 h-5" />,
  EDICION: <Edit3 className="w-5 h-5" />,
  METRICAS: <BarChart3 className="w-5 h-5" />,
  ESTADO: <RefreshCw className="w-5 h-5" />,
  ARCHIVADO: <Archive className="w-5 h-5" />
};

export default function HistorialCambios({ campana, onCerrar }: HistorialCambiosProps) {
  const [historial, setHistorial] = useState<HistorialCambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    tipoCambio: '',
    usuario: '',
    fechaDesde: '',
    fechaHasta: ''
  });

  const { getLogsByEntity } = useLogging();

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        setCargando(true);
        setError(null);
        const logs = await getLogsByEntity(String(campana.id));
        const historico = logs
          .map((log) => transformarLogACambio(log, campana.id))
          .filter((item): item is HistorialCambio => item !== null);
        setHistorial(historico);
      } catch (err) {
        console.error('Error cargando historial de cambios:', err);
        setError('Error cargando historial de cambios');
      } finally {
        setCargando(false);
      }
    };

    cargarHistorial();
  }, [campana.id, getLogsByEntity]);

  const historialFiltrado = useMemo(() => {
    return historial.filter((cambio) => {
      if (filtros.tipoCambio && cambio.tipoCambio !== filtros.tipoCambio) return false;
      if (filtros.usuario && !cambio.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())) return false;
      if (filtros.fechaDesde && new Date(cambio.fechaCambio) < new Date(filtros.fechaDesde)) return false;
      if (filtros.fechaHasta && new Date(cambio.fechaCambio) > new Date(filtros.fechaHasta)) return false;
      return true;
    });
  }, [historial, filtros]);

  const handleFiltroChange = (campo: keyof typeof filtros, valor: string) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor
    }));
  };

  const formatearValor = (valor: any) => {
    if (valor === null || valor === undefined) return 'N/A';
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
    if (typeof valor === 'number') return valor.toLocaleString();
    if (valor instanceof Date) return format(valor, 'dd/MM/yyyy HH:mm', { locale: es });
    if (typeof valor === 'object') return JSON.stringify(valor, null, 2);
    return String(valor);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 lg:px-6 lg:py-5 flex-shrink-0 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
              >
                <History className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  Historial de Cambios
                </h2>
                <p className="text-gray-400 text-sm truncate">{campana.nombre}</p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-4 lg:p-6 overflow-y-auto flex-1">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" style={{ color: '#ef0000' }} />
              Filtros
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Tipo de Cambio
                </label>
                <select
                  value={filtros.tipoCambio}
                  onChange={(e) => handleFiltroChange('tipoCambio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
                >
                  <option value="">Todos</option>
                  {Object.entries(TIPOS_CAMBIO_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Usuario
                </label>
                <input
                  type="text"
                  value={filtros.usuario}
                  onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                  placeholder="Buscar por usuario..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
                />
              </div>
            </div>
          </div>

          {cargando ? (
            <div className="text-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-900">Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">Error</p>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historialFiltrado.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
                    <History className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-1">No se encontraron cambios</p>
                  <p className="text-sm text-gray-600">Intenta ajustar los filtros</p>
                </div>
              ) : (
                historialFiltrado.map((cambio) => (
                  <div key={cambio.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${TIPOS_CAMBIO_COLORS[cambio.tipoCambio]}`}>
                          {TIPOS_CAMBIO_ICONS[cambio.tipoCambio]}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${TIPOS_CAMBIO_COLORS[cambio.tipoCambio]}`}>
                              {TIPOS_CAMBIO_LABELS[cambio.tipoCambio]}
                            </span>
                            <span className="text-sm text-gray-700 font-bold">
                              {cambio.campoModificado}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">{format(cambio.fechaCambio, 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-800">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-bold">{cambio.usuario}</span>
                            <span className="text-gray-600">registró un cambio en</span>
                            <span className="font-bold text-gray-900">{cambio.campoModificado}</span>
                          </div>
                          
                          {cambio.valorAnterior !== null && cambio.valorNuevo !== null && (
                            <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg">
                              <span className="bg-red-100 text-red-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                                {formatearValor(cambio.valorAnterior)}
                              </span>
                              <ArrowRight className="w-4 h-4 text-gray-500" />
                              <span className="bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-xs font-bold">
                                {formatearValor(cambio.valorNuevo)}
                              </span>
                            </div>
                          )}
                          
                          {cambio.comentario && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 pl-4 py-2 rounded-r-lg">
                              <p className="text-sm text-blue-900 italic font-medium">
                                "{cambio.comentario}"
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-4 lg:px-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <p className="text-sm text-gray-700 font-bold flex items-center gap-2">
              <History className="w-4 h-4" style={{ color: '#ef0000' }} />
              {historialFiltrado.length} cambio{historialFiltrado.length !== 1 ? 's' : ''} encontrado{historialFiltrado.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onCerrar}
              className="w-full sm:w-auto px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              <X className="w-4 h-4" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

function transformarLogACambio(log: LogEntry, campanaId: string | number): HistorialCambio | null {
  if (!log.timestamp) {
    return null;
  }

  const tipoCambio = determinarTipoCambio(log);
  let valorAnterior: any = null;
  let valorNuevo: any = null;

  if (log.detalles && typeof log.detalles === 'object' && !Array.isArray(log.detalles)) {
    const detallesObj = log.detalles as Record<string, unknown>;
    if ('antes' in detallesObj) valorAnterior = detallesObj['antes'];
    if ('despues' in detallesObj) valorNuevo = detallesObj['despues'];
  }

  return {
    id: String(log.id),
    idCampana: String(campanaId),
    tipoCambio,
    campoModificado: log.descripcion || log.entidad || 'Cambio',
    valorAnterior,
    valorNuevo,
    usuario: log.usuario,
    fechaCambio: log.timestamp,
    comentario: log.descripcion || undefined
  };
}

function determinarTipoCambio(log: LogEntry): HistorialCambio['tipoCambio'] {
  const accion = log.accion.toLowerCase();
  if (accion.includes('crear')) return 'CREACION';
  if (accion.includes('archiv')) return 'ARCHIVADO';
  if (accion.includes('reactivar') || accion.includes('estado')) return 'ESTADO';
  if (accion.includes('métric') || accion.includes('metric')) return 'METRICAS';
  return 'EDICION';
}
