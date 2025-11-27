import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Campana, MetricasGlobales } from '../../types';
import { metricasService } from '../../services/metricasService';
import { 
  TrendingUp, 
  X, 
  DollarSign, 
  Users, 
  Target, 
  Car, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Award
} from 'lucide-react';

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
      case 'EXCELENTE': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'BUENO': return <CheckCircle className="w-5 h-5 text-yellow-600" />;
      case 'REGULAR': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'MALO': return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'CRITICO': return <AlertCircle className="w-5 h-5 text-red-800" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRecomendacionIcono = (tipo: string) => {
    switch (tipo) {
      case 'success': return <Award className="w-6 h-6 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-600" />;
      case 'critical': return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'info': return <Info className="w-6 h-6 text-blue-600" />;
      default: return <Zap className="w-6 h-6 text-purple-600" />;
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
    return createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            <span className="text-lg font-bold text-gray-900">Cargando métricas...</span>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  if (error) {
    return createPortal(
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-700 mb-6 font-medium">{error}</p>
            <button
              onClick={onCerrar}
              className="w-full px-6 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 lg:px-6 lg:py-5 flex-shrink-0 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
              >
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  Métricas Globales
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
          {metricas ? (
            <>
              {/* Resumen Global */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-blue-700 font-bold mb-1">Costo Total</p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-blue-900">
                    ${(metricas.costoTotal || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-green-700 font-bold mb-1">Alcance Total</p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-green-900">
                    {(metricas.alcanceTotal || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-purple-700 font-bold mb-1">Leads Totales</p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-purple-900">
                    {(metricas.leadsTotales || 0).toLocaleString()}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-sm text-orange-700 font-bold mb-1">Conductores</p>
                  <p className="text-2xl lg:text-3xl font-extrabold text-orange-900">
                    {(metricas.conductoresTotales || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Métricas de Eficiencia */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" style={{ color: '#ef0000' }} />
                  Métricas de Eficiencia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-bold text-gray-700">Costo Promedio por Lead</h4>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">
                      ${metricas.costoPromedioLead?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Car className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-bold text-gray-700">Costo Promedio por Conductor</h4>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">
                      ${metricas.costoPromedioConductor?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-bold text-gray-700">ROI</h4>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {metricas.roi?.toFixed(1) || '0.0'}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Evaluaciones de Métricas */}
              {metricas.evaluaciones && metricas.evaluaciones.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" style={{ color: '#ef0000' }} />
                    Evaluación vs Métricas Ideales
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="space-y-3">
                      {metricas.evaluaciones.map((evaluacion, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div>{getEstadoIcono(evaluacion.estado)}</div>
                            <div>
                              <p className="font-bold text-gray-900">{evaluacion.metrica}</p>
                              <p className="text-sm text-gray-600 font-medium">
                                {evaluacion.valorActual.toLocaleString()} / {evaluacion.valorIdeal.toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${getEstadoColor(evaluacion.estado)}`}>
                              {evaluacion.estado}
                            </span>
                            <p className="text-xs text-gray-600 mt-2 font-medium">
                              {evaluacion.porcentajeDesviacion.toFixed(1)}% del ideal
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Recomendaciones de Marketing Experto */}
              {recomendacionesMarketing && recomendacionesMarketing.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" style={{ color: '#ef0000' }} />
                    Recomendaciones de Marketing Experto
                  </h3>
                  <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 shadow-sm">
                    <div className="space-y-4">
                      {recomendacionesMarketing.map((recomendacion, index) => (
                        <div key={index} className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 mt-1">
                              {getRecomendacionIcono(recomendacion.tipo)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900 mb-2 text-base">{recomendacion.titulo}</h4>
                              <p className="text-sm text-gray-700 mb-3 font-medium">{recomendacion.mensaje}</p>
                              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-500 pl-4 py-3 rounded-r-lg">
                                <p className="text-sm text-blue-900 font-bold">
                                  <Zap className="w-4 h-4 inline mr-1" />
                                  Acción recomendada:
                                </p>
                                <p className="text-sm text-blue-800 mt-1 font-medium">
                                  {recomendacion.accion}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">No hay métricas disponibles</p>
              <p className="text-sm text-gray-600">Esta campaña aún no tiene métricas globales</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-4 lg:px-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onCerrar}
              className="px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
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
