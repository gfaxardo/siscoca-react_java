import { useState, useEffect } from 'react';
import { MetricaIdeal, Vertical, Pais, Plataforma, Segmento } from '../../types';

interface ConfigurarMetricasIdealesProps {
  onCerrar: () => void;
}

const VERTICALES: Vertical[] = ['MOTO_PERSONA', 'MOTO_TAXI', 'MOTO_DELIVERY'];
const PAISES: Pais[] = ['PERU', 'COLOMBIA', 'MEXICO', 'CHILE'];
const PLATAFORMAS: Plataforma[] = ['FACEBOOK', 'TIKTOK', 'GOOGLE', 'INSTAGRAM'];
const SEGMENTOS: Segmento[] = ['ADQUISICION', 'RETENCION', 'REACTIVACION'];

const CATEGORIAS = [
  { codigo: 'ALCANCE', nombre: 'Alcance', unidad: 'personas' },
  { codigo: 'LEADS', nombre: 'Leads', unidad: 'leads' },
  { codigo: 'COSTO', nombre: 'Costo', unidad: 'USD' },
  { codigo: 'CONDUCTORES', nombre: 'Conductores', unidad: 'conductores' },
  { codigo: 'CONVERSION', nombre: 'Conversión', unidad: '%' }
];

export default function ConfigurarMetricasIdeales({ onCerrar }: ConfigurarMetricasIdealesProps) {
  const [filtros, setFiltros] = useState({
    vertical: '' as Vertical | '',
    pais: '' as Pais | '',
    plataforma: '' as Plataforma | '',
    segmento: '' as Segmento | ''
  });

  const [metricasIdeales, setMetricasIdeales] = useState<MetricaIdeal[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar métricas ideales al montar el componente
  useEffect(() => {
    cargarMetricasIdeales();
  }, [filtros]);

  const cargarMetricasIdeales = async () => {
    try {
      setCargando(true);
      // Aquí harías la llamada al API
      // const metricas = await metricasService.obtenerMetricasIdeales(filtros);
      // setMetricasIdeales(metricas);
      
      // Por ahora, datos de ejemplo
      setMetricasIdeales([
        {
          id: '1',
          nombre: 'Alcance Ideal',
          valorIdeal: 1000,
          valorMinimo: 800,
          valorMaximo: 1500,
          unidad: 'personas',
          categoria: 'ALCANCE',
          vertical: 'MOTO_PERSONA',
          pais: 'PERU',
          plataforma: 'FACEBOOK',
          segmento: 'ADQUISICION',
          activa: true,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        }
      ]);
    } catch (err) {
      setError('Error cargando métricas ideales');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleFiltroChange = (campo: keyof typeof filtros, valor: string) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor as any
    }));
  };

  const handleCrearMetrica = () => {
    const nuevaMetrica: MetricaIdeal = {
      id: Date.now().toString(),
      nombre: '',
      valorIdeal: 0,
      valorMinimo: 0,
      valorMaximo: 0,
      unidad: 'USD',
      categoria: 'ALCANCE',
      vertical: filtros.vertical || undefined,
      pais: filtros.pais || undefined,
      plataforma: filtros.plataforma || undefined,
      segmento: filtros.segmento || undefined,
      activa: true,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date()
    };

    setMetricasIdeales(prev => [...prev, nuevaMetrica]);
  };

  const handleActualizarMetrica = (id: string, campo: keyof MetricaIdeal, valor: any) => {
    setMetricasIdeales(prev => prev.map(m => 
      m.id === id ? { ...m, [campo]: valor, fechaActualizacion: new Date() } : m
    ));
  };

  const handleEliminarMetrica = (id: string) => {
    setMetricasIdeales(prev => prev.filter(m => m.id !== id));
  };

  const handleGuardar = async () => {
    try {
      setCargando(true);
      // Aquí harías la llamada al API para guardar
      // await metricasService.guardarMetricasIdeales(metricasIdeales);
      console.log('Guardando métricas ideales:', metricasIdeales);
      onCerrar();
    } catch (err) {
      setError('Error guardando métricas ideales');
      console.error('Error:', err);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-700 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">⚙️ Configurar Métricas Ideales</h2>
              <p className="text-purple-100 text-sm mt-1">
                Define los valores ideales para cada métrica según vertical, país, plataforma y segmento
              </p>
            </div>
            <button
              onClick={onCerrar}
              className="text-white hover:text-purple-200 transition-colors"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros de Configuración</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vertical</label>
                <select
                  value={filtros.vertical}
                  onChange={(e) => handleFiltroChange('vertical', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {VERTICALES.map(v => (
                    <option key={v} value={v}>{v.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                <select
                  value={filtros.pais}
                  onChange={(e) => handleFiltroChange('pais', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {PAISES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plataforma</label>
                <select
                  value={filtros.plataforma}
                  onChange={(e) => handleFiltroChange('plataforma', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {PLATAFORMAS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Segmento</label>
                <select
                  value={filtros.segmento}
                  onChange={(e) => handleFiltroChange('segmento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {SEGMENTOS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Métricas Ideales */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">📊 Métricas Configuradas</h3>
              <button
                onClick={handleCrearMetrica}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                + Agregar Métrica
              </button>
            </div>

            {cargando ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando métricas...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metricasIdeales.map((metrica) => (
                  <div key={metrica.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={metrica.nombre}
                          onChange={(e) => handleActualizarMetrica(metrica.id, 'nombre', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Ej: Alcance Ideal"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                        <select
                          value={metrica.categoria}
                          onChange={(e) => handleActualizarMetrica(metrica.id, 'categoria', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {CATEGORIAS.map(cat => (
                            <option key={cat.codigo} value={cat.codigo}>{cat.nombre}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Ideal</label>
                        <input
                          type="number"
                          value={metrica.valorIdeal}
                          onChange={(e) => handleActualizarMetrica(metrica.id, 'valorIdeal', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo</label>
                        <input
                          type="number"
                          value={metrica.valorMinimo}
                          onChange={(e) => handleActualizarMetrica(metrica.id, 'valorMinimo', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor Máximo</label>
                        <input
                          type="number"
                          value={metrica.valorMaximo}
                          onChange={(e) => handleActualizarMetrica(metrica.id, 'valorMaximo', parseFloat(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEliminarMetrica(metrica.id)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCerrar}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={cargando}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
