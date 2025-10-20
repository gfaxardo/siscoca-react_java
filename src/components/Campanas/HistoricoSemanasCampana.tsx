import { useState } from 'react';
import { Campana } from '../../types';
import { subWeeks, startOfWeek, format, getYear } from 'date-fns';
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

// Función para calcular semana ISO
const obtenerSemanaISO = (fecha: Date): number => {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 + week1.getDay() + 1) / 7);
};

export default function HistoricoSemanasCampana({ 
  campana, 
  onCerrar, 
  onGuardarHistorico,
  historicoExistente 
}: HistoricoSemanasCampanaProps) {
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(0);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
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
    
    for (let i = 0; i < 12; i++) {
      const semana = subWeeks(ahora, i);
      const inicioSemana = startOfWeek(semana, { weekStartsOn: 1 });
      const semanaISO = obtenerSemanaISO(inicioSemana);
      const año = getYear(inicioSemana);
      
      opciones.push({
        valor: semanaISO,
        label: `Semana ${semanaISO} (${año}) - ${format(inicioSemana, 'dd/MM', { locale: es })}`,
        fecha: inicioSemana
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

  const manejarGuardar = async () => {
    // Validar que al menos haya una métrica
    const tieneMetricasTrafficker = Object.values(metricasTrafficker).some(v => v.trim() !== '');
    const tieneMetricasDueno = Object.values(metricasDueno).some(v => v.trim() !== '');
    
    if (!tieneMetricasTrafficker && !tieneMetricasDueno) {
      alert('❌ Debes ingresar al menos una métrica (trafficker o dueño)');
      return;
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
        alert(`✅ ${resultado.mensaje}`);
        setMostrarFormulario(false);
        setSemanaSeleccionada(0);
      } else {
        alert(`❌ ${resultado.mensaje}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error}`);
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminarSemana = (semanaISO: number) => {
    if (confirm(`¿Eliminar datos de la semana ${semanaISO}?\n\nEsta acción no se puede deshacer.`)) {
      // Aquí implementarías la eliminación
      alert('Funcionalidad de eliminación pendiente de implementar');
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
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Métricas - Semana {semanaSeleccionada}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  semanaTieneDatos(semanaSeleccionada)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {semanaTieneDatos(semanaSeleccionada) ? 'Editando' : 'Nueva'}
                </span>
              </div>

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clics</label>
                      <input
                        type="number"
                        value={metricasTrafficker.clics}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, clics: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 2500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Leads</label>
                      <input
                        type="number"
                        value={metricasTrafficker.leads}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, leads: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo Semanal (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={metricasTrafficker.costoSemanal}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, costoSemanal: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: 5000.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo/Lead (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={metricasTrafficker.costoLead}
                        onChange={(e) => setMetricasTrafficker(prev => ({ ...prev, costoLead: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  onClick={() => setMostrarFormulario(false)}
                  disabled={guardando}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={manejarGuardar}
                  disabled={guardando}
                  className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {guardando ? 'Guardando...' : 'Guardar Métricas'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
