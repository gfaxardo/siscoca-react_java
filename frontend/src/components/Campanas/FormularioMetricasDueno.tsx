import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana, MetricasDueno } from '../../types';
import { subWeeks, startOfWeek, endOfWeek, format, getYear, getISOWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const esquemaFormulario = z.object({
  idCampana: z.string(),
  conductoresRegistrados: z.number().min(0, 'Debe ser un número positivo'),
  conductoresPrimerViaje: z.number().min(0, 'Debe ser un número positivo')
}).refine((data) => data.conductoresPrimerViaje <= data.conductoresRegistrados, {
  message: '⚠️ Los conductores de primer viaje no pueden ser mayores que los registros (es un funnel: Registros → Conductores)',
  path: ['conductoresPrimerViaje']
});

// Función para calcular semana ISO correctamente usando date-fns
const obtenerSemanaISO = (fecha: Date): number => {
  return getISOWeek(fecha);
};

// Función para obtener rango de fechas de una semana ISO
const obtenerRangoSemana = (semanaISO: number, año: number): { inicio: Date; fin: Date; rango: string } => {
  const fechaReferencia = new Date(año, 0, 4);
  const inicioSemana1 = startOfWeek(fechaReferencia, { weekStartsOn: 1 });
  const inicioSemana = new Date(inicioSemana1);
  inicioSemana.setDate(inicioSemana.getDate() + (semanaISO - 1) * 7);
  const finSemana = endOfWeek(inicioSemana, { weekStartsOn: 1 });
  const rango = `${format(inicioSemana, 'dd', { locale: es })} ${format(inicioSemana, 'MMM', { locale: es })} - ${format(finSemana, 'dd', { locale: es })} ${format(finSemana, 'MMM', { locale: es })} ${format(finSemana, 'yyyy')}`;
  return { inicio: inicioSemana, fin: finSemana, rango };
};

interface FormularioMetricasDuenoProps {
  campana: Campana;
  onCerrar: () => void;
}

export default function FormularioMetricasDuenoComponent({ campana, onCerrar }: FormularioMetricasDuenoProps) {
  const { completarMetricasDueno, guardarHistoricoSemanal, obtenerHistoricoSemanalCampana } = useCampanaStore();
  
  // Inicializar con la semana actual por defecto
  const obtenerSemanaActual = (): number => {
    const ahora = new Date();
    const inicioSemana = startOfWeek(ahora, { weekStartsOn: 1 });
    return obtenerSemanaISO(inicioSemana);
  };
  
  const [semanaSeleccionada, setSemanaSeleccionada] = useState<number>(obtenerSemanaActual());
  
  // Generar opciones de semanas (últimas 12 semanas + semana actual)
  const generarOpcionesSemanas = () => {
    const ahora = new Date();
    const opciones = [];
    
    for (let i = 0; i < 13; i++) {
      const semana = subWeeks(ahora, i);
      const inicioSemana = startOfWeek(semana, { weekStartsOn: 1 });
      const semanaISO = obtenerSemanaISO(inicioSemana);
      const año = getYear(inicioSemana);
      const rangoSemana = obtenerRangoSemana(semanaISO, año);
      
      opciones.push({
        valor: semanaISO,
        label: `${i === 0 ? '🕒 Semana Actual - ' : ''}Semana ${semanaISO} (${año}) - ${rangoSemana.rango}`,
        fecha: inicioSemana,
        rango: rangoSemana.rango
      });
    }
    
    return opciones;
  };
  
  const opcionesSemanas = generarOpcionesSemanas();
  const historicoExistente = obtenerHistoricoSemanalCampana(campana.id);
  const semanaActualSeleccionada = opcionesSemanas.find(o => o.valor === semanaSeleccionada);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<MetricasDueno>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      idCampana: campana.id,
      conductoresRegistrados: campana.conductoresRegistrados || 0,
      conductoresPrimerViaje: campana.conductoresPrimerViaje || 0
    }
  });

  // Observar cambios en costoSemanal y conductoresPrimerViaje para calcular automáticamente costoConductor
  const conductoresPrimerViaje = watch('conductoresPrimerViaje');
  const costoSemanal = campana.costoSemanal;

  useEffect(() => {
    // Calcular costo por conductor usando conductoresPrimerViaje (no registros)
    if (costoSemanal && conductoresPrimerViaje && conductoresPrimerViaje > 0) {
      // Actualizar el store para que el cálculo se refleje
      // Nota: El store calculará esto automáticamente al guardar, pero mostramos el cálculo aquí
    } else if (costoSemanal === 0 || conductoresPrimerViaje === 0) {
      // Si el costo o conductores son 0, el costo por conductor debe ser 0
    }
  }, [costoSemanal, conductoresPrimerViaje]);

  const onSubmit = async (datos: MetricasDueno) => {
    // Validar funnel de métricas dueño
    const registros = Number(datos.conductoresRegistrados);
    const conductores = Number(datos.conductoresPrimerViaje);
    
    if (conductores > registros) {
      alert('⚠️ Los conductores de primer viaje no pueden ser mayores que los registros (es un funnel: Registros → Conductores)');
      return;
    }
    
    const esSemanaActual = semanaSeleccionada === obtenerSemanaActual();
    
    if (esSemanaActual) {
      // Guardar como métricas actuales de la campaña
      // Verificar si ya tiene métricas para advertir sobre sobrescritura
      if (campana.conductoresRegistrados || campana.conductoresPrimerViaje) {
        const confirmar = window.confirm(
          `⚠️ Esta campaña ya tiene métricas del dueño guardadas.\n\n` +
          `¿Deseas sobrescribir las métricas existentes?\n\n` +
          `Métricas actuales:\n` +
          `- Registros: ${campana.conductoresRegistrados || 0}\n` +
          `- Conductores: ${campana.conductoresPrimerViaje || 0}\n\n` +
          `Si continúas, estas métricas serán reemplazadas.`
        );
        
        if (!confirmar) {
          return;
        }
      }
      
      const resultado = await completarMetricasDueno({
        ...datos,
        conductoresRegistrados: registros,
        conductoresPrimerViaje: conductores
      });
      
      if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        onCerrar();
      } else {
        alert(`❌ ${resultado.mensaje}`);
      }
    } else {
      // Guardar como histórico semanal
      const datosExistentes = historicoExistente.find(h => h.semanaISO === semanaSeleccionada);
      if (datosExistentes) {
        const confirmar = window.confirm(
          `⚠️ La semana ${semanaSeleccionada} ya tiene métricas guardadas.\n\n` +
          `¿Deseas reemplazar las métricas existentes?\n\n` +
          `Si continúas, las métricas actuales serán sobrescritas.`
        );
        
        if (!confirmar) {
          return;
        }
      }
      
      const fechaSemana = semanaActualSeleccionada?.fecha || new Date();
      const resultadoHistorico = await guardarHistoricoSemanal({
        idCampana: campana.id,
        semanaISO: semanaSeleccionada,
        fechaSemana,
        conductoresRegistrados: registros,
        conductoresPrimerViaje: conductores
      });
      
      if (resultadoHistorico.exito) {
        const accion = datosExistentes ? 'reemplazadas' : 'guardadas';
        alert(`✅ Métricas ${accion} exitosamente para la semana ${semanaSeleccionada}`);
        onCerrar();
      } else {
        alert(`❌ ${resultadoHistorico.mensaje}`);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">👥 Métricas del Dueño</h2>
            <p className="text-sm text-gray-600 mt-1">Campaña: {campana.nombre} ({campana.id})</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <input type="hidden" {...register('idCampana')} />

          {/* Selector de Semana */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 Seleccionar Semana
            </label>
            <select
              value={semanaSeleccionada}
              onChange={(e) => {
                setSemanaSeleccionada(parseInt(e.target.value));
                // Cargar datos de la semana seleccionada si existen
                const datosSemana = historicoExistente.find(h => h.semanaISO === parseInt(e.target.value));
                if (datosSemana) {
                  setValue('conductoresRegistrados', datosSemana.conductoresRegistrados || campana.conductoresRegistrados || 0);
                  setValue('conductoresPrimerViaje', datosSemana.conductoresPrimerViaje || campana.conductoresPrimerViaje || 0);
                } else {
                  // Si no hay datos, usar datos actuales de la campaña
                  setValue('conductoresRegistrados', campana.conductoresRegistrados || 0);
                  setValue('conductoresPrimerViaje', campana.conductoresPrimerViaje || 0);
                }
              }}
              className="w-full px-4 py-3 border border-orange-300 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all font-medium"
            >
              {opcionesSemanas.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.label}
                </option>
              ))}
            </select>
            {semanaActualSeleccionada && (
              <p className="text-xs text-orange-600 mt-2">
                📆 Período: {semanaActualSeleccionada.rango}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Registros (Personas que se registraron) *
            </label>
            <input
              {...register('conductoresRegistrados', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent transition-all text-lg"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Personas que completaron el registro en la plataforma
            </p>
            {errors.conductoresRegistrados && (
              <p className="text-red-500 text-sm mt-1">{errors.conductoresRegistrados.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Conductores (Personas que ya hicieron viajes) *
            </label>
            <input
              {...register('conductoresPrimerViaje', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent transition-all text-lg"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Personas que ya completaron su primer viaje (conductores activos)
            </p>
            {errors.conductoresPrimerViaje && (
              <p className="text-red-500 text-sm mt-1">{errors.conductoresPrimerViaje.message}</p>
            )}
            {/* Mostrar cálculo automático en tiempo real */}
            {costoSemanal && conductoresPrimerViaje && conductoresPrimerViaje > 0 && (
              <p className="text-xs text-green-600 mt-1 font-medium">
                💰 Costo por Conductor: ${Math.round((costoSemanal / conductoresPrimerViaje) * 100) / 100} USD
              </p>
            )}
          </div>

          {/* Cálculo automático de costo por conductor */}
          {costoSemanal && conductoresPrimerViaje && conductoresPrimerViaje > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-semibold mb-2">💰 Cálculo Automático</p>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <strong>Costo por Conductor:</strong> ${Math.round((costoSemanal / conductoresPrimerViaje) * 100) / 100} USD
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Fórmula: Costo Semanal ({costoSemanal} USD) ÷ Conductores ({conductoresPrimerViaje}) = ${Math.round((costoSemanal / conductoresPrimerViaje) * 100) / 100} USD
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Diferencia importante:</span>
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1 ml-4">
              <li>• <strong>Registros:</strong> Personas que se registraron en la plataforma</li>
              <li>• <strong>Conductores:</strong> Personas que ya hicieron al menos un viaje</li>
              <li className="mt-2">El sistema calculará automáticamente:</li>
              <li>• Costo por Registro (USD) = Costo Semanal ÷ Registros</li>
              <li>• Costo por Conductor (USD) = Costo Semanal ÷ Conductores (usando conductoresPrimerViaje)</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-warning-500 hover:bg-warning-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Completar Métricas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


