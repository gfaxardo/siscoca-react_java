import { useState, useEffect } from 'react';
import { HistorialCambio, Campana } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistorialCambiosProps {
  campana: Campana;
  onCerrar: () => void;
}

const TIPOS_CAMBIO_LABELS = {
  CREACION: 'Creación',
  EDICION: 'Edición',
  METRICAS: 'Métricas',
  ESTADO: 'Estado',
  ARCHIVADO: 'Archivado'
};

const TIPOS_CAMBIO_COLORS = {
  CREACION: 'bg-green-100 text-green-800',
  EDICION: 'bg-blue-100 text-blue-800',
  METRICAS: 'bg-purple-100 text-purple-800',
  ESTADO: 'bg-yellow-100 text-yellow-800',
  ARCHIVADO: 'bg-gray-100 text-gray-800'
};

const TIPOS_CAMBIO_ICONS = {
  CREACION: '🆕',
  EDICION: '✏️',
  METRICAS: '📊',
  ESTADO: '🔄',
  ARCHIVADO: '📁'
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

  useEffect(() => {
    cargarHistorial();
  }, [campana.id, filtros]);

  const cargarHistorial = async () => {
    try {
      setCargando(true);
      // Aquí harías la llamada al API
      // const historialData = await historialService.obtenerHistorialCampana(campana.id, filtros);
      // setHistorial(historialData);
      
      // Por ahora, datos de ejemplo
      setHistorial([
        {
          id: '1',
          idCampana: campana.id,
          tipoCambio: 'CREACION',
          campoModificado: 'Campaña creada',
          valorAnterior: null,
          valorNuevo: campana.nombre,
          usuario: 'Ana C.',
          fechaCambio: new Date('2024-01-15T10:30:00'),
          comentario: 'Campaña creada desde el formulario'
        },
        {
          id: '2',
          idCampana: campana.id,
          tipoCambio: 'METRICAS',
          campoModificado: 'Alcance',
          valorAnterior: '1000',
          valorNuevo: '1250',
          usuario: 'Diego V.',
          fechaCambio: new Date('2024-01-15T14:30:00'),
          comentario: 'Actualización de métricas del trafficker'
        },
        {
          id: '3',
          idCampana: campana.id,
          tipoCambio: 'ESTADO',
          campoModificado: 'Estado',
          valorAnterior: 'Pendiente',
          valorNuevo: 'Activa',
          usuario: 'Ana C.',
          fechaCambio: new Date('2024-01-15T16:45:00'),
          comentario: 'Campaña activada después de revisión'
        }
      ]);
    } catch (err) {
      setError('Error cargando historial de cambios');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleFiltroChange = (campo: keyof typeof filtros, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const formatearValor = (valor: any) => {
    if (valor === null || valor === undefined) return 'N/A';
    if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
    if (typeof valor === 'number') return valor.toLocaleString();
    return String(valor);
  };

  const historialFiltrado = historial.filter(cambio => {
    if (filtros.tipoCambio && cambio.tipoCambio !== filtros.tipoCambio) return false;
    if (filtros.usuario && !cambio.usuario.toLowerCase().includes(filtros.usuario.toLowerCase())) return false;
    if (filtros.fechaDesde && new Date(cambio.fechaCambio) < new Date(filtros.fechaDesde)) return false;
    if (filtros.fechaHasta && new Date(cambio.fechaCambio) > new Date(filtros.fechaHasta)) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📋 Historial de Cambios</h2>
              <p className="text-indigo-100 text-sm mt-1">{campana.nombre}</p>
            </div>
            <button
              onClick={onCerrar}
              className="text-white hover:text-indigo-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Filtros */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Cambio</label>
                <select
                  value={filtros.tipoCambio}
                  onChange={(e) => handleFiltroChange('tipoCambio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {Object.entries(TIPOS_CAMBIO_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
                <input
                  type="text"
                  value={filtros.usuario}
                  onChange={(e) => handleFiltroChange('usuario', e.target.value)}
                  placeholder="Buscar por usuario..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
                <input
                  type="date"
                  value={filtros.fechaDesde}
                  onChange={(e) => handleFiltroChange('fechaDesde', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
                <input
                  type="date"
                  value={filtros.fechaHasta}
                  onChange={(e) => handleFiltroChange('fechaHasta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Lista de Cambios */}
          {cargando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando historial...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historialFiltrado.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <p className="text-gray-600">No se encontraron cambios</p>
                </div>
              ) : (
                historialFiltrado.map((cambio) => (
                  <div key={cambio.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${TIPOS_CAMBIO_COLORS[cambio.tipoCambio]}`}>
                          {TIPOS_CAMBIO_ICONS[cambio.tipoCambio]}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIPOS_CAMBIO_COLORS[cambio.tipoCambio]}`}>
                              {TIPOS_CAMBIO_LABELS[cambio.tipoCambio]}
                            </span>
                            <span className="text-sm text-gray-500">
                              {cambio.campoModificado}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(cambio.fechaCambio, 'dd/MM/yyyy HH:mm', { locale: es })}
                          </span>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{cambio.usuario}</span> cambió{' '}
                            <span className="font-medium">{cambio.campoModificado}</span>
                          </p>
                          
                          {cambio.valorAnterior !== null && cambio.valorNuevo !== null && (
                            <div className="mt-1 text-sm text-gray-600">
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                {formatearValor(cambio.valorAnterior)}
                              </span>
                              <span className="mx-2">→</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                {formatearValor(cambio.valorNuevo)}
                              </span>
                            </div>
                          )}
                          
                          {cambio.comentario && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              "{cambio.comentario}"
                            </p>
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

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {historialFiltrado.length} cambio{historialFiltrado.length !== 1 ? 's' : ''} encontrado{historialFiltrado.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={onCerrar}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
