import { useState } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana } from '../../types';
import { subWeeks, startOfWeek, endOfWeek, format, getYear, getISOWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoricoSemanalCampana {
  id: string;
  idCampana: string;
  semanaISO: number;
  fechaSemana: Date;
  // Métricas trafficker
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number;
  costoLead?: number;
  // Métricas dueño
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  // Metadatos
  fechaRegistro: Date;
  registradoPor: string;
}

interface HistoricoSemanasCampanaProps {
  campana: Campana;
  onCerrar: () => void;
  onGuardarHistorico: (datos: Omit<HistoricoSemanalCampana, 'id' | 'fechaRegistro' | 'registradoPor'>) => Promise<{ exito: boolean; mensaje: string }>;
  historicoExistente: HistoricoSemanalCampana[];
}

// Función para calcular semana ISO correctamente usando date-fns
const obtenerSemanaISO = (fecha: Date): number => {
  return getISOWeek(fecha);
};

// Función para obtener rango de fechas de una semana ISO
const obtenerRangoSemana = (semanaISO: number, año: number): { inicio: Date; fin: Date; rango: string } => {
  // Calcular la fecha del primer día de la semana 1 del año
  const fechaReferencia = new Date(año, 0, 4); // 4 de enero es siempre la semana 1
  const inicioSemana1 = startOfWeek(fechaReferencia, { weekStartsOn: 1 });
  
  // Calcular la fecha de inicio de la semana solicitada
  const inicioSemana = new Date(inicioSemana1);
  inicioSemana.setDate(inicioSemana.getDate() + (semanaISO - 1) * 7);
  
  const finSemana = endOfWeek(inicioSemana, { weekStartsOn: 1 });
  
  const rango = `${format(inicioSemana, 'dd', { locale: es })} ${format(inicioSemana, 'MMM', { locale: es })} - ${format(finSemana, 'dd', { locale: es })} ${format(finSemana, 'MMM', { locale: es })} ${format(finSemana, 'yyyy')}`;
  
  return { inicio: inicioSemana, fin: finSemana, rango };
};

export default function HistoricoSemanasCampana({ 
  campana, 
  onCerrar, 
  onGuardarHistorico,
  historicoExistente 
}: HistoricoSemanasCampanaProps) {
  const { eliminarHistoricoSemanal } = useCampanaStore();
  // Inicializar con la semana anterior por defecto
  const obtenerSemanaAnterior = (): number => {
    const ahora = new Date();
    const semanaAnterior = subWeeks(ahora, 1);
    const inicioSemanaAnterior = startOfWeek(semanaAnterior, { weekStartsOn: 1 });
    return obtenerSemanaISO(inicioSemanaAnterior);
  };
  
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(obtenerSemanaAnterior());
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);
  
  // Estados del formulario
  const [metricasTrafficker, setMetricasTrafficker] = useState({
    alcance: '',
    clics: '',
    leads: '',
    costoSemanal: '',
    costoLead: ''
  });
  
  const [metricasDueno, setMetricasDueno] = useState({
    conductoresRegistrados: '',
    conductoresPrimerViaje: ''
  });

  // Generar opciones de semanas (últimas 12 semanas)
  const generarOpcionesSemanas = () => {
    const ahora = new Date();
    const opciones = [];
    
    // La semana 0 es la anterior (semana actual - 1), luego las demás
    for (let i = 0; i < 12; i++) {
      // i=0 es la semana anterior, i=1 es la actual, i=2 es hace 2 semanas, etc.
      const semanasAtras = i === 0 ? 1 : i; // Semana anterior primero
      const semana = subWeeks(ahora, semanasAtras);
      const inicioSemana = startOfWeek(semana, { weekStartsOn: 1 });
      const semanaISO = obtenerSemanaISO(inicioSemana);
      const año = getYear(inicioSemana);
      
      // Obtener rango de fechas usando la función mejorada
      const rangoSemana = obtenerRangoSemana(semanaISO, año);
      
      opciones.push({
        valor: semanaISO,
        label: `${i === 0 ? '🕒 Semana Anterior - ' : ''}Semana ${semanaISO} (${año}) - ${rangoSemana.rango}`,
        fecha: inicioSemana,
        rango: rangoSemana.rango
      });
    }
    
    return opciones;
  };

  const opcionesSemanas = generarOpcionesSemanas();

  // Verificar si una semana ya tiene datos
  const semanaTieneDatos = (semanaISO: number) => {
    return historicoExistente.some(h => h.semanaISO === semanaISO);
  };

  // Obtener datos existentes de una semana
  const obtenerDatosSemana = (semanaISO: number) => {
    return historicoExistente.find(h => h.semanaISO === semanaISO);
  };

  const manejarSeleccionSemana = (semanaISO: number) => {
    setSemanaSeleccionada(semanaISO);
    
    // Si la semana ya tiene datos, cargarlos
    const datosExistentes = obtenerDatosSemana(semanaISO);
    if (datosExistentes) {
      setMetricasTrafficker({
        alcance: datosExistentes.alcance?.toString() || '',
        clics: datosExistentes.clics?.toString() || '',
        leads: datosExistentes.leads?.toString() || '',
        costoSemanal: datosExistentes.costoSemanal?.toString() || '',
        costoLead: datosExistentes.costoLead?.toString() || ''
      });
      
      setMetricasDueno({
        conductoresRegistrados: datosExistentes.conductoresRegistrados?.toString() || '',
        conductoresPrimerViaje: datosExistentes.conductoresPrimerViaje?.toString() || ''
      });
    } else {
      // Limpiar formulario para nueva semana
      setMetricasTrafficker({
        alcance: '',
        clics: '',
        leads: '',
        costoSemanal: '',
        costoLead: ''
      });
      
      setMetricasDueno({
        conductoresRegistrados: '',
        conductoresPrimerViaje: ''
      });
    }
    
    setMostrarFormulario(true);
  };

  const manejarGuardar = async (forzarReemplazo: boolean = false) => {
    // Validar que al menos haya una métrica
    const tieneMetricasTrafficker = Object.values(metricasTrafficker).some(v => v.trim() !== '');
    const tieneMetricasDueno = Object.values(metricasDueno).some(v => v.trim() !== '');
    
    if (!tieneMetricasTrafficker && !tieneMetricasDueno) {
      alert('❌ Debes ingresar al menos una métrica (trafficker o dueño)');
      return;
    }

    // Validar funnel de métricas trafficker si están presentes
    if (tieneMetricasTrafficker) {
      const alcance = parseInt(metricasTrafficker.alcance) || 0;
      const clics = parseInt(metricasTrafficker.clics) || 0;
      const leads = parseInt(metricasTrafficker.leads) || 0;
      
      if (clics > alcance) {
        alert('⚠️ Los clics no pueden ser mayores que el alcance (es un funnel: Alcance → Clics → Leads)');
        return;
      }
      
      if (leads > clics) {
        alert('⚠️ Los leads no pueden ser mayores que los clics (es un funnel: Alcance → Clics → Leads)');
        return;
      }
    }

    // Validar funnel de métricas dueño si están presentes
    if (tieneMetricasDueno) {
      const registros = parseInt(metricasDueno.conductoresRegistrados) || 0;
      const conductores = parseInt(metricasDueno.conductoresPrimerViaje) || 0;
      
      if (conductores > registros) {
        alert('⚠️ Los conductores de primer viaje no pueden ser mayores que los registros (es un funnel: Registros → Conductores)');
        return;
      }
    }

    // Si ya existe y no se fuerza reemplazo, confirmar
    const datosExistentes = obtenerDatosSemana(semanaSeleccionada);
    if (datosExistentes && !forzarReemplazo) {
      const confirmar = window.confirm(
        `⚠️ La semana ${semanaSeleccionada} ya tiene métricas guardadas.\n\n` +
        `¿Deseas reemplazar las métricas existentes?\n\n` +
        `Si continúas, las métricas actuales serán sobrescritas.`
      );
      
      if (!confirmar) {
        return;
      }
    }

    setGuardando(true);
    
    try {
      const datosParaGuardar = {
        idCampana: campana.id,
        semanaISO: semanaSeleccionada,
        fechaSemana: opcionesSemanas.find(o => o.valor === semanaSeleccionada)?.fecha || new Date(),
        // Métricas trafficker (solo si tienen valor)
        ...(metricasTrafficker.alcance && { alcance: parseInt(metricasTrafficker.alcance) }),
        ...(metricasTrafficker.clics && { clics: parseInt(metricasTrafficker.clics) }),
        ...(metricasTrafficker.leads && { leads: parseInt(metricasTrafficker.leads) }),
        ...(metricasTrafficker.costoSemanal && { costoSemanal: parseFloat(metricasTrafficker.costoSemanal) }),
        ...(metricasTrafficker.costoLead && { costoLead: parseFloat(metricasTrafficker.costoLead) }),
        // Métricas dueño (solo si tienen valor)
        ...(metricasDueno.conductoresRegistrados && { conductoresRegistrados: parseInt(metricasDueno.conductoresRegistrados) }),
        ...(metricasDueno.conductoresPrimerViaje && { conductoresPrimerViaje: parseInt(metricasDueno.conductoresPrimerViaje) })
      };

      const resultado = await onGuardarHistorico(datosParaGuardar);
      
      if (resultado.exito) {
        const accion = datosExistentes ? 'reemplazadas' : 'guardadas';
        alert(`✅ Métricas ${accion} exitosamente para la semana ${semanaSeleccionada}`);
        setMostrarFormulario(false);
        setSemanaSeleccionada(0);
        
        // Limpiar formulario
        setMetricasTrafficker({
          alcance: '',
          clics: '',
          leads: '',
          costoSemanal: '',
          costoLead: ''
        });
        setMetricasDueno({
          conductoresRegistrados: '',
          conductoresPrimerViaje: ''
        });
        
        // Recargar datos actualizados
        window.location.reload();
      } else {
        alert(`❌ ${resultado.mensaje}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminarSemana = async (semanaISO: number) => {
    const datosExistentes = obtenerDatosSemana(semanaISO);
    
    if (!datosExistentes) {
      alert('❌ No hay datos para eliminar para esta semana');
      return;
    }
    
    const confirmar = window.confirm(
      `⚠️ ¿Eliminar métricas de la semana ${semanaISO}?\n\n` +
      `Esta acción eliminará permanentemente todas las métricas guardadas para esta semana.\n\n` +
      `Esta acción NO se puede deshacer.`
    );
    
    if (!confirmar) {
      return;
    }

    setEliminando(semanaISO);
    
    try {
      const resultado = await eliminarHistoricoSemanal(datosExistentes.id);
      
      if (resultado.exito) {
        alert(`✅ Métricas de la semana ${semanaISO} eliminadas exitosamente`);
        
        // Si estaba en el formulario de esta semana, cerrarlo
        if (semanaSeleccionada === semanaISO) {
          setMostrarFormulario(false);
          setSemanaSeleccionada(0);
          setMetricasTrafficker({
            alcance: '',
            clics: '',
            leads: '',
            costoSemanal: '',
            costoLead: ''
          });
          setMetricasDueno({
            conductoresRegistrados: '',
            conductoresPrimerViaje: ''
          });
        }
        
        // Recargar datos actualizados
        window.location.reload();
      } else {
        alert(`❌ ${resultado.mensaje}`);
      }
    } catch (error) {
      alert(`❌ Error eliminando métricas: ${error}`);
    } finally {
      setEliminando(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📅 Histórico de Semanas</h2>
            <p className="text-sm text-gray-600 mt-1">Campaña: {campana.nombre}</p>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Selector de semanas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Semana</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {opcionesSemanas.map((opcion) => (
                <button
                  key={opcion.valor}
                  onClick={() => manejarSeleccionSemana(opcion.valor)}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    semanaTieneDatos(opcion.valor)
                      ? 'border-green-300 bg-green-50 hover:bg-green-100'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{opcion.label}</p>
                      <p className="text-sm text-gray-500">
                        {format(opcion.fecha, 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                    {semanaTieneDatos(opcion.valor) && (
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-sm">✅</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            manejarEliminarSemana(opcion.valor);
                          }}
                          disabled={eliminando === opcion.valor}
                          className={`text-red-500 hover:text-red-700 text-sm transition-opacity ${
                            eliminando === opcion.valor ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          title="Eliminar métricas de esta semana"
                        >
                          {eliminando === opcion.valor ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Formulario de métricas */}
          {mostrarFormulario && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Métricas - Semana {semanaSeleccionada}
                  </h3>
                  {(() => {
                    const año = getYear(new Date());
                    const rango = obtenerRangoSemana(semanaSeleccionada, año);
                    return (
                      <p className="text-sm text-gray-600 mt-1">
                        {rango.rango}
                      </p>
                    );
                  })()}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    semanaTieneDatos(semanaSeleccionada)
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {semanaTieneDatos(semanaSeleccionada) ? '⚠️ Reemplazando' : '✨ Nueva'}
                  </span>
                  {semanaTieneDatos(semanaSeleccionada) && (
                    <button
                      onClick={() => manejarEliminarSemana(semanaSeleccionada)}
                      disabled={eliminando === semanaSeleccionada}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                        eliminando === semanaSeleccionada
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                      title="Eliminar métricas de esta semana"
                    >
                      {eliminando === semanaSeleccionada ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                    </button>
                  )}
                </div>
              </div>
              
              {semanaTieneDatos(semanaSeleccionada) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-orange-800">
                    <span className="font-semibold">⚠️ Advertencia:</span> Esta semana ya tiene métricas guardadas. 
                    Al guardar, las métricas existentes serán reemplazadas.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Métricas Trafficker */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-4">📊 Métricas Trafficker</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alcance</label>
                      <input
                        type="number"
                        value={metricasTrafficker.alcance}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, alcance: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ej: 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clics</label>
                      <input
                        type="number"
                        value={metricasTrafficker.clics}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, clics: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ej: 2500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leads</label>
                      <input
                        type="number"
                        value={metricasTrafficker.leads}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, leads: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ej: 500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo Semanal (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={metricasTrafficker.costoSemanal}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, costoSemanal: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ej: 5000.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo/Lead (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={metricasTrafficker.costoLead}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, costoLead: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Ej: 10.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Métricas Dueño */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-4">👥 Métricas Dueño</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conductores Registrados</label>
                      <input
                        type="number"
                        value={metricasDueno.conductoresRegistrados}
                        onChange={(e) => setMetricasDueno(prev => ({ ...prev, conductoresRegistrados: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Ej: 120"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conductores Primer Viaje</label>
                      <input
                        type="number"
                        value={metricasDueno.conductoresPrimerViaje}
                        onChange={(e) => setMetricasDueno(prev => ({ ...prev, conductoresPrimerViaje: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Ej: 80"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setSemanaSeleccionada(0);
                    setMetricasTrafficker({
                      alcance: '',
                      clics: '',
                      leads: '',
                      costoSemanal: '',
                      costoLead: ''
                    });
                    setMetricasDueno({
                      conductoresRegistrados: '',
                      conductoresPrimerViaje: ''
                    });
                  }}
                  disabled={guardando || eliminando === semanaSeleccionada}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                {semanaTieneDatos(semanaSeleccionada) && (
                  <button
                    onClick={() => manejarEliminarSemana(semanaSeleccionada)}
                    disabled={eliminando === semanaSeleccionada || guardando}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      eliminando === semanaSeleccionada || guardando
                        ? 'bg-gray-300 text-gray-500'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    title="Eliminar métricas de esta semana"
                  >
                    {eliminando === semanaSeleccionada ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                  </button>
                )}
                <button
                  onClick={() => manejarGuardar()}
                  disabled={guardando || eliminando === semanaSeleccionada}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    semanaTieneDatos(semanaSeleccionada)
                      ? 'bg-orange-600 hover:bg-orange-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {guardando 
                    ? '⏳ Guardando...' 
                    : semanaTieneDatos(semanaSeleccionada)
                    ? '⚠️ Reemplazar Métricas'
                    : '✨ Guardar Métricas'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
