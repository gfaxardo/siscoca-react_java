import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCampanaStore } from '../../store/useCampanaStore';
import { useNotification } from '../../hooks/useNotification';
import { Campana, MetricasDueno } from '../../types';
import { subWeeks, startOfWeek, endOfWeek, format, getYear, getISOWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Users, 
  X, 
  Save, 
  Calendar, 
  UserPlus, 
  Car, 
  DollarSign, 
  Loader2,
  Info
} from 'lucide-react';

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
  // Hooks
  const notify = useNotification();
  const { completarMetricasDueno, guardarHistoricoSemanal, obtenerHistoricoSemanalCampana, obtenerCampanas } = useCampanaStore();
  
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
  
  // Obtener el costo semanal de la semana seleccionada
  const obtenerCostoSemanal = () => {
    const esSemanaActual = semanaSeleccionada === obtenerSemanaActual();
    if (esSemanaActual) {
      return campana.costoSemanal || 0;
    } else {
      // Buscar en el histórico de la semana seleccionada
      const datosSemana = historicoExistente.find(h => h.semanaISO === semanaSeleccionada);
      return datosSemana?.costoSemanal || campana.costoSemanal || 0;
    }
  };

  const [costoSemanalActual, setCostoSemanalActual] = useState(obtenerCostoSemanal());
  
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
  
  // Actualizar costo semanal cuando cambia la semana seleccionada
  useEffect(() => {
    const nuevoCosto = obtenerCostoSemanal();
    setCostoSemanalActual(nuevoCosto);
  }, [semanaSeleccionada, historicoExistente]);

  useEffect(() => {
    // Calcular costo por conductor usando conductoresPrimerViaje (no registros)
    if (costoSemanalActual && conductoresPrimerViaje && conductoresPrimerViaje > 0) {
      // Actualizar el store para que el cálculo se refleje
      // Nota: El store calculará esto automáticamente al guardar, pero mostramos el cálculo aquí
    } else if (costoSemanalActual === 0 || conductoresPrimerViaje === 0) {
      // Si el costo o conductores son 0, el costo por conductor debe ser 0
    }
  }, [costoSemanalActual, conductoresPrimerViaje]);

  const onSubmit = async (datos: MetricasDueno) => {
    // Validar funnel de métricas dueño
    const registros = Number(datos.conductoresRegistrados);
    const conductores = Number(datos.conductoresPrimerViaje);
    
    if (conductores > registros) {
      notify.warning(' Los conductores de primer viaje no pueden ser mayores que los registros (es un funnel: Registros → Conductores)');
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
        notify.success(resultado.mensaje);
        await obtenerCampanas(); // Auto-refresh
        onCerrar();
      } else {
        notify.error(resultado.mensaje);
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
        notify.success(`Métricas ${accion} exitosamente para la semana ${semanaSeleccionada}`);
        await obtenerCampanas(); // Auto-refresh
        // Recargar histórico para asegurar que los datos se muestren después de recargar la página
        const { obtenerHistorico } = useCampanaStore.getState();
        await obtenerHistorico();
        onCerrar();
      } else {
        notify.error(resultadoHistorico.mensaje);
      }
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 flex justify-between items-center flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                Métricas del Dueño
              </h2>
              <p className="text-sm text-gray-400 truncate">{campana.nombre}</p>
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

        {/* Contenedor con scroll */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6">
            <input type="hidden" {...register('idCampana')} />

            {/* Selector de Semana */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 shadow-sm">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#ef0000' }} />
                Seleccionar Semana
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
              >
                {opcionesSemanas.map((opcion) => (
                  <option key={opcion.valor} value={opcion.valor}>
                    {opcion.label}
                  </option>
                ))}
              </select>
              {semanaActualSeleccionada && (
                <p className="text-xs text-orange-700 mt-2 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Período: {semanaActualSeleccionada.rango}
                </p>
              )}
            </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" style={{ color: '#ef0000' }} />
              Registros (Personas que se registraron) *
            </label>
            <input
              {...register('conductoresRegistrados', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg font-bold hover:border-gray-400"
              placeholder="0"
            />
            <p className="text-xs text-gray-600 mt-2 font-medium">
              Personas que completaron el registro en la plataforma
            </p>
            {errors.conductoresRegistrados && (
              <p className="text-red-600 text-xs mt-1 font-medium">{errors.conductoresRegistrados.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Car className="w-4 h-4" style={{ color: '#ef0000' }} />
              Conductores (Personas que ya hicieron viajes) *
            </label>
            <input
              {...register('conductoresPrimerViaje', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg font-bold hover:border-gray-400"
              placeholder="0"
            />
            <p className="text-xs text-gray-600 mt-2 font-medium">
              Personas que ya completaron su primer viaje (conductores activos)
            </p>
            {errors.conductoresPrimerViaje && (
              <p className="text-red-600 text-xs mt-1 font-medium">{errors.conductoresPrimerViaje.message}</p>
            )}
            {/* Mostrar cálculo automático en tiempo real */}
            {costoSemanalActual && conductoresPrimerViaje && conductoresPrimerViaje > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-700 font-bold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Costo por Conductor: ${Math.round((costoSemanalActual / conductoresPrimerViaje) * 100) / 100} USD
                </p>
              </div>
            )}
          </div>

          {/* Cálculo automático de costo por conductor */}
          {costoSemanalActual && conductoresPrimerViaje && conductoresPrimerViaje > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 shadow-sm">
              <p className="text-sm text-green-900 font-bold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Cálculo Automático
              </p>
              <div className="text-sm text-green-800 space-y-2 font-medium">
                <p>
                  <strong>Costo por Conductor:</strong> ${Math.round((costoSemanalActual / conductoresPrimerViaje) * 100) / 100} USD
                </p>
                <p className="text-xs text-green-700">
                  Fórmula: Costo Semanal ({costoSemanalActual} USD) ÷ Conductores ({conductoresPrimerViaje}) = ${Math.round((costoSemanalActual / conductoresPrimerViaje) * 100) / 100} USD
                </p>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-blue-900 font-bold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Diferencia importante
            </p>
            <ul className="text-sm text-blue-800 space-y-2 font-medium">
              <li className="flex items-start gap-2">
                <UserPlus className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Registros:</strong> Personas que se registraron en la plataforma
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Car className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Conductores:</strong> Personas que ya hicieron al menos un viaje
                </div>
              </li>
              <li className="flex items-start gap-2 pt-2 border-t border-blue-200">
                <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  El sistema calculará automáticamente:
                  <div className="mt-1 space-y-1">
                    <div>• Costo por Registro = Costo Semanal ÷ Registros</div>
                    <div>• Costo por Conductor = Costo Semanal ÷ Conductores</div>
                  </div>
                </div>
              </li>
              {costoSemanalActual > 0 && (
                <li className="flex items-start gap-2 pt-2 border-t border-blue-200">
                  <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div className="text-xs">
                    Costo semanal de la semana {semanaSeleccionada}: <strong>${costoSemanalActual} USD</strong>
                  </div>
                </li>
              )}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCerrar}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 shadow hover:shadow-md flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
              style={{ background: isSubmitting ? '#9ca3af' : 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Completar Métricas
                </>
              )}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}


