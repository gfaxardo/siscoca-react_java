import { useState, useEffect } from 'react';
import { Campana, MetricasGlobales } from '../../types';
import { metricasService } from '../../services/metricasService';

interface MetricasGlobalesProps {
  campana: Campana;
  onCerrar: () => void;
}

export default function MetricasGlobalesComponent({ campana, onCerrar }: MetricasGlobalesProps) {
  const [metricas, setMetricas] = useState<MetricasGlobales | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarMetricas();
  }, [campana.id]);

  const calcularMetricasLocales = (): MetricasGlobales => {
    // Calcular métricas globales desde los datos de la campaña
    const alcance = campana.alcance || 0;
    const leads = campana.leads || 0;
    const costoSemanal = campana.costoSemanal || 0;
    const conductoresPrimerViaje = campana.conductoresPrimerViaje || 0;
    
    const costoLead = campana.costoLead || (leads > 0 ? costoSemanal / leads : 0);
    const costoConductorPrimerViaje = conductoresPrimerViaje > 0 ? costoSemanal / conductoresPrimerViaje : 0;
    
    // Calcular costo promedio
    const costoPromedioLead = costoLead;
    const costoPromedioConductor = costoConductorPrimerViaje;
    
    // Calcular ROI aproximado (se puede mejorar con datos reales)
    const roi = costoSemanal > 0 && conductoresPrimerViaje > 0 ? ((conductoresPrimerViaje * 100) / costoSemanal) : 0;
    
    return {
      costoTotal: costoSemanal,
      alcanceTotal: alcance,
      leadsTotales: leads,
      conductoresTotales: conductoresPrimerViaje,
      costoPromedioLead: costoPromedioLead,
      costoPromedioConductor: costoPromedioConductor,
      roi: roi,
      evaluaciones: [] // Se puede calcular comparando con métricas ideales si están disponibles
    };
  };

  const cargarMetricas = async () => {
    try {
      setCargando(true);
      setError(null);
      // Intentar obtener desde el backend
      try {
        const datos = await metricasService.obtenerMetricasGlobales(campana.id);
        if (datos) {
          setMetricas(datos);
        } else {
          // Si no hay datos del backend, calcular localmente
          setMetricas(calcularMetricasLocales());
        }
      } catch (backendError) {
        // Si el backend falla, calcular localmente desde los datos de la campaña
        console.warn('No se pudieron obtener métricas del backend, calculando localmente:', backendError);
        setMetricas(calcularMetricasLocales());
      }
    } catch (err) {
      console.error('Error:', err);
      // Intentar calcular localmente como último recurso
      try {
        setMetricas(calcularMetricasLocales());
      } catch (calcError) {
        setError('Error cargando métricas globales');
        console.error('Error calculando métricas:', calcError);
      }
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

  // Función para generar recomendaciones de marketing experto
  const generarRecomendacionesMarketing = () => {
    if (!campana) return [];
    
    const recomendaciones = [];
    
    // Usar datos actuales de la campaña para análisis
    const alcance = campana.alcance || 0;
    const clics = campana.clics || 0;
    const leads = campana.leads || 0;
    const registros = campana.conductoresRegistrados || 0;
    const conductores = campana.conductoresPrimerViaje || 0;
    const costo = campana.costoSemanal || 0;
    
    // Calcular tasas de conversión
    const tasaClicsAlcance = alcance > 0 ? (clics / alcance) * 100 : 0;
    const tasaLeadsClics = clics > 0 ? (leads / clics) * 100 : 0;
    const tasaRegistrosLeads = leads > 0 ? (registros / leads) * 100 : 0;
    const tasaConductoresRegistros = registros > 0 ? (conductores / registros) * 100 : 0;
    
    // Análisis 1: Alcance vs Clics (problema de atención)
    if (alcance > 0 && tasaClicsAlcance < 1) {
      recomendaciones.push({
        tipo: 'warning',
        icono: '⚠️',
        titulo: 'Bajo Clic Rate - Problema de Mensaje',
        mensaje: 'El alcance es alto pero los clics son muy bajos. Esto indica que el mensaje creativo no está resonando con tu audiencia.',
        accion: 'Reformula tu propuesta de valor, revisa los creativos y considera A/B testing'
      });
    }
    
    // Análisis 2: Clics vs Leads (problema de conversión en página)
    if (clics > 0 && tasaLeadsClics < 5 && leads < 100) {
      recomendaciones.push({
        tipo: 'critical',
        icono: '🔴',
        titulo: 'Baja Conversión a Leads - Problema en Landing',
        mensaje: 'Los usuarios hacen clic pero no se convierten en leads. La landing page o el proceso de captura no está optimizado.',
        accion: 'Revisa la UX de la landing, simplifica formularios, agrega elementos de urgencia y credibilidad'
      });
    }
    
    // Análisis 3: Leads pero sin registros (problema de cierre)
    if (leads > 0 && registros === 0) {
      recomendaciones.push({
        tipo: 'critical',
        icono: '🎯',
        titulo: 'Alto Abandono Post-Lead - Problema de Cierre',
        mensaje: 'Tienes leads pero cero registros. El problema está en el proceso de onboarding o cierre.',
        accion: 'Mejora el seguimiento de leads, automatiza recordatorios, simplifica el proceso de registro y ofrece incentivos'
      });
    }
    
    // Análisis 4: Buen alcance, buena conversión, pero sin presupuesto efectivo
    if (alcance > 5000 && tasaClicsAlcance > 2 && tasaLeadsClics > 10 && costo === 0) {
      recomendaciones.push({
        tipo: 'info',
        icono: '💰',
        titulo: 'Potencial No Monetizado',
        mensaje: 'Tu campaña tiene buen alcance y conversión pero no hay presupuesto asignado para escalar.',
        accion: 'Considera aumentar el presupuesto para maximizar el ROI de este segmento'
      });
    }
    
    // Análisis 5: Alto costo pero bajo alcance (problema de targeting)
    if (costo > 500 && alcance < 1000) {
      recomendaciones.push({
        tipo: 'warning',
        icono: '🎯',
        titulo: 'Alto Costo por Alcance - Targeting Excesivamente Restrictivo',
        mensaje: 'El costo es alto pero el alcance es muy bajo. Tu audiencia está demasiado específica o los CPCs son muy altos.',
        accion: 'Amplía la audiencia, reconsidera el targeting, prueba otras plataformas o reformula tu oferta'
      });
    }
    
    // Análisis 6: Todo está bien pero no hay conductores (problema operacional)
    if (registros > 0 && tasaConductoresRegistros < 30) {
      recomendaciones.push({
        tipo: 'warning',
        icono: '🚗',
        titulo: 'Baja Activación de Conductores',
        mensaje: 'Hay muchos registros pero pocos conductores activos. Falta motivación o facilidad para el primer viaje.',
        accion: 'Ofrece bonos de bienvenida, simplifica el primer viaje, mejora la comunicación post-registro y genera urgencia'
      });
    }
    
    // Análisis 7: Todo funciona bien (felicitaciones)
    if (alcance > 5000 && tasaClicsAlcance > 2 && tasaLeadsClics > 8 && tasaRegistrosLeads > 40 && tasaConductoresRegistros > 50) {
      recomendaciones.push({
        tipo: 'success',
        icono: '🎉',
        titulo: 'Campaña Excepcional - Escala Ahora',
        mensaje: 'Todas tus métricas están excelentes. Es el momento perfecto para aumentar el presupuesto.',
        accion: 'Escala el presupuesto, replica el targeting y creativos en otras verticales, considera remarketing'
      });
    }
    
    return recomendaciones;
  };
  
  const recomendacionesMarketing = generarRecomendacionesMarketing();

  if (cargando) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Cargando métricas...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onCerrar}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-4 py-3 lg:px-6 lg:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg lg:text-2xl font-bold">📊 Métricas Globales</h2>
              <p className="text-blue-100 text-xs lg:text-sm mt-1">{campana.nombre}</p>
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

        <div className="p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          {metricas ? (
            <>
              {/* Resumen Global */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 lg:mb-6">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs lg:text-sm text-blue-600 font-medium">Costo Total</p>
                      <p className="text-lg lg:text-2xl font-bold text-blue-900">
                        ${(metricas.costoTotal || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Alcance Total</p>
                      <p className="text-2xl font-bold text-green-900">
                        {(metricas.alcanceTotal || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-3xl">👥</div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Leads Totales</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {(metricas.leadsTotales || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-3xl">🎯</div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">Conductores</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {(metricas.conductoresTotales || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-3xl">🚗</div>
                  </div>
                </div>
              </div>

              {/* Métricas de Eficiencia */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Promedio por Lead</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ${metricas.costoPromedioLead?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Costo Promedio por Conductor</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ${metricas.costoPromedioConductor?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">ROI</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {metricas.roi?.toFixed(1) || '0.0'}%
                  </p>
                </div>
              </div>

              {/* Evaluaciones de Métricas */}
              {metricas.evaluaciones && metricas.evaluaciones.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Evaluación vs Métricas Ideales</h3>
                  <div className="space-y-3">
                    {metricas.evaluaciones.map((evaluacion, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getEstadoIcono(evaluacion.estado)}</span>
                          <div>
                            <p className="font-medium text-gray-900">{evaluacion.metrica}</p>
                            <p className="text-sm text-gray-600">
                              {evaluacion.valorActual.toLocaleString()} / {evaluacion.valorIdeal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(evaluacion.estado)}`}>
                            {evaluacion.estado}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {evaluacion.porcentajeDesviacion.toFixed(1)}% del ideal
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones de Marketing Experto */}
              {recomendacionesMarketing && recomendacionesMarketing.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">💡</span>
                    Recomendaciones de Marketing Experto
                  </h3>
                  <div className="space-y-4">
                    {recomendacionesMarketing.map((recomendacion, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl mt-1">{recomendacion.icono}</span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{recomendacion.titulo}</h4>
                            <p className="text-sm text-gray-700 mb-2">{recomendacion.mensaje}</p>
                            <div className="bg-blue-50 border-l-4 border-blue-500 pl-3 py-2 rounded-r">
                              <p className="text-sm text-blue-900">
                                <span className="font-semibold">💼 Acción recomendada:</span> {recomendacion.accion}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay métricas disponibles para esta campaña</p>
            </div>
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
