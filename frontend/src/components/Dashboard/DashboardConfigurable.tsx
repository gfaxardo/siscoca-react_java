import { useState, useEffect } from 'react';
import { Campana, MetricaIdeal, EvaluacionMetrica } from '../../types';

interface DashboardConfigurableProps {
  onCerrar: () => void;
}

export default function DashboardConfigurable({ onCerrar }: DashboardConfigurableProps) {
  const [campanas, setCampanas] = useState<Campana[]>([]);
  const [metricasIdeales, setMetricasIdeales] = useState<MetricaIdeal[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionMetrica[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    vertical: '',
    pais: '',
    plataforma: '',
    segmento: '',
    estado: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [filtros]);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      // Aquí harías las llamadas al API
      // const [campanasData, metricasData] = await Promise.all([
      //   campanaService.obtenerCampanas(filtros),
      //   metricasService.obtenerMetricasIdeales(filtros)
      // ]);
      
      // Por ahora, datos de ejemplo
      setCampanas([]);
      setMetricasIdeales([]);
      setEvaluaciones([]);
    } catch (err) {
      setError('Error cargando datos del dashboard');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'EXCELENTE': return 'text-green-600 bg-green-100';
      case 'BUENO': return 'text-yellow-600 bg-yellow-100';
      case 'REGULAR': return 'text-orange-600 bg-orange-100';
      case 'MALO': return 'text-red-600 bg-red-100';
      case 'CRITICO': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcono = (estado: string) => {
    switch (estado) {
      case 'EXCELENTE': return '🟢';
      case 'BUENO': return '🟡';
      case 'REGULAR': return '🟠';
      case 'MALO': return '🔴';
      case 'CRITICO': return '⚫';
      default: return '⚪';
    }
  };

  const estadisticasResumen = {
    totalCampanas: campanas.length,
    campanasActivas: campanas.filter(c => c.estado === 'Activa').length,
    campanasPendientes: campanas.filter(c => c.estado === 'Pendiente').length,
    campanasArchivadas: campanas.filter(c => c.estado === 'Archivada').length,
    evaluacionesExcelentes: evaluaciones.filter(e => e.estado === 'EXCELENTE').length,
    evaluacionesBuenas: evaluaciones.filter(e => e.estado === 'BUENO').length,
    evaluacionesRegulares: evaluaciones.filter(e => e.estado === 'REGULAR').length,
    evaluacionesMalas: evaluaciones.filter(e => e.estado === 'MALO').length,
    evaluacionesCriticas: evaluaciones.filter(e => e.estado === 'CRITICO').length
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">🏠 Dashboard Configurable</h2>
              <p className="text-blue-100 text-sm mt-1">
                Vista general de métricas y rendimiento de campañas
              </p>
            </div>
            <button
              onClick={onCerrar}
              className="text-white hover:text-blue-200 transition-colors"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros del Dashboard</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vertical</label>
                <select
                  value={filtros.vertical}
                  onChange={(e) => setFiltros(prev => ({ ...prev, vertical: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="MOTO_PERSONA">Moto Persona</option>
                  <option value="MOTO_TAXI">Moto Taxi</option>
                  <option value="MOTO_DELIVERY">Moto Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                <select
                  value={filtros.pais}
                  onChange={(e) => setFiltros(prev => ({ ...prev, pais: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="PERU">Perú</option>
                  <option value="COLOMBIA">Colombia</option>
                  <option value="MEXICO">México</option>
                  <option value="CHILE">Chile</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
                <select
                  value={filtros.plataforma}
                  onChange={(e) => setFiltros(prev => ({ ...prev, plataforma: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="FACEBOOK">Facebook</option>
                  <option value="TIKTOK">TikTok</option>
                  <option value="GOOGLE">Google</option>
                  <option value="INSTAGRAM">Instagram</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segmento</label>
                <select
                  value={filtros.segmento}
                  onChange={(e) => setFiltros(prev => ({ ...prev, segmento: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="ADQUISICION">Adquisición</option>
                  <option value="RETENCION">Retención</option>
                  <option value="REACTIVACION">Reactivación</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filtros.estado}
                  onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Activa">Activa</option>
                  <option value="Archivada">Archivada</option>
                </select>
              </div>
            </div>
          </div>

          {cargando ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando dashboard...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <p className="text-red-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Resumen de Estadísticas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Total Campañas</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {estadisticasResumen.totalCampanas}
                      </p>
                    </div>
                    <div className="text-3xl">📊</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Campañas Activas</p>
                      <p className="text-2xl font-bold text-green-900">
                        {estadisticasResumen.campanasActivas}
                      </p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {estadisticasResumen.campanasPendientes}
                      </p>
                    </div>
                    <div className="text-3xl">⏳</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Archivadas</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {estadisticasResumen.campanasArchivadas}
                      </p>
                    </div>
                    <div className="text-3xl">📁</div>
                  </div>
                </div>
              </div>

              {/* Evaluaciones de Rendimiento */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Evaluaciones de Rendimiento</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-3xl mb-2">🟢</div>
                    <p className="text-sm text-gray-600">Excelente</p>
                    <p className="text-2xl font-bold text-green-600">
                      {estadisticasResumen.evaluacionesExcelentes}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🟡</div>
                    <p className="text-sm text-gray-600">Bueno</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {estadisticasResumen.evaluacionesBuenas}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🟠</div>
                    <p className="text-sm text-gray-600">Regular</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {estadisticasResumen.evaluacionesRegulares}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔴</div>
                    <p className="text-sm text-gray-600">Malo</p>
                    <p className="text-2xl font-bold text-red-600">
                      {estadisticasResumen.evaluacionesMalas}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">⚫</div>
                    <p className="text-sm text-gray-600">Crítico</p>
                    <p className="text-2xl font-bold text-red-800">
                      {estadisticasResumen.evaluacionesCriticas}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Campañas con Evaluaciones */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Campañas y Evaluaciones</h3>
                {campanas.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">📊</div>
                    <p className="text-gray-600">No hay campañas que coincidan con los filtros</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campanas.map((campana) => (
                      <div key={campana.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-lg">
                              {campana.nombre.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{campana.nombre}</h4>
                            <p className="text-sm text-gray-600">
                              {campana.vertical} • {campana.pais} • {campana.plataforma}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            campana.estado === 'Activa' ? 'bg-green-100 text-green-800' :
                            campana.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {campana.estado}
                          </span>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Rendimiento</p>
                            <div className="flex items-center space-x-1">
                              <span className="text-lg">🟢</span>
                              <span className="text-sm font-medium text-green-600">Excelente</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end">
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
