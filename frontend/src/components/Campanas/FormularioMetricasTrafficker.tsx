import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana, MetricasTrafficker } from '../../types';
import { subWeeks, startOfWeek, endOfWeek, format, getYear, getISOWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const esquemaFormulario = z.object({
  idCampana: z.string(),
  urlInforme: z.string().url('URL inválida').optional().or(z.literal('')),
  alcance: z.number().min(0, 'El alcance debe ser positivo'),
  clics: z.number().min(0, 'Los clics deben ser positivos'),
  leads: z.number().min(0, 'Los leads deben ser positivos'),
  costoSemanal: z.number().min(0, 'El costo debe ser positivo').max(999999, 'El costo no puede exceder $999,999 USD'),
  costoLead: z.number().min(0).max(9999, 'El costo por lead no puede exceder $9,999 USD').optional()
}).refine((data) => data.clics <= data.alcance, {
  message: '⚠️ Los clics no pueden ser mayores que el alcance (es un funnel: Alcance → Clics → Leads)',
  path: ['clics']
}).refine((data) => data.leads <= data.clics, {
  message: '⚠️ Los leads no pueden ser mayores que los clics (es un funnel: Alcance → Clics → Leads)',
  path: ['leads']
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

interface FormularioMetricasTraffickerProps {
  campana: Campana;
  onCerrar: () => void;
}

export default function FormularioMetricasTraffickerComponent({ campana, onCerrar }: FormularioMetricasTraffickerProps) {
  const subirMetricasTrafficker = useCampanaStore((state) => state.subirMetricasTrafficker);
  const guardarHistoricoSemanal = useCampanaStore((state) => state.guardarHistoricoSemanal);
  const historicoSemanasCampanas = useCampanaStore((state) => state.historicoSemanasCampanas);
  
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
  const historicoExistente = useMemo(
    () => historicoSemanasCampanas.filter(h => h.idCampana === campana.id),
    [historicoSemanasCampanas, campana.id]
  );
  const semanaActualSeleccionada = opcionesSemanas.find(o => o.valor === semanaSeleccionada);
  
  // Obtener el costo semanal de la semana seleccionada para el cálculo
  const obtenerCostoSemanalParaCalculo = () => {
    const esSemanaActual = semanaSeleccionada === obtenerSemanaActual();
    if (esSemanaActual) {
      return campana.costoSemanal || 0;
    } else {
      // Buscar en el histórico de la semana seleccionada
      const datosSemana = historicoExistente.find(h => h.semanaISO === semanaSeleccionada);
      return datosSemana?.costoSemanal || campana.costoSemanal || 0;
    }
  };

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<MetricasTrafficker>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      idCampana: campana.id,
      urlInforme: campana.urlInforme || '',
      alcance: campana.alcance || 0,
      clics: campana.clics || 0,
      leads: campana.leads || 0,
      costoSemanal: campana.costoSemanal || 0,
      costoLead: campana.costoLead
    }
  });

  // Observar cambios en costoSemanal y leads para calcular automáticamente costoLead
  const costoSemanalInput = watch('costoSemanal');
  const leads = watch('leads');
  
  // Usar el costo semanal correcto según la semana seleccionada
  const costoSemanalParaCalculo = costoSemanalInput || obtenerCostoSemanalParaCalculo();

  useEffect(() => {
    // Usar el costo semanal del input si está disponible, sino usar el de la semana seleccionada
    const costoParaCalcular = costoSemanalInput || obtenerCostoSemanalParaCalculo();
    
    if (costoParaCalcular && leads && leads > 0) {
      const costoLeadCalculado = costoParaCalcular / leads;
      // Redondear a 2 decimales
      const costoLeadRedondeado = Math.round(costoLeadCalculado * 100) / 100;
      setValue('costoLead', costoLeadRedondeado, { shouldValidate: true });
    } else if (costoParaCalcular === 0 || leads === 0) {
      // Si el costo o leads son 0, el costo por lead debe ser 0
      setValue('costoLead', 0, { shouldValidate: true });
    }
  }, [costoSemanalInput, leads, semanaSeleccionada, historicoExistente, setValue]);

  const onSubmit = async (datos: MetricasTrafficker) => {
    // Validar funnel de métricas trafficker
    const alcance = Number(datos.alcance);
    const clics = Number(datos.clics);
    const leads = Number(datos.leads);
    
    if (clics > alcance) {
      alert('⚠️ Los clics no pueden ser mayores que el alcance (es un funnel: Alcance → Clics → Leads)');
      return;
    }
    
    if (leads > clics) {
      alert('⚠️ Los leads no pueden ser mayores que los clics (es un funnel: Alcance → Clics → Leads)');
      return;
    }
    
    const esSemanaActual = semanaSeleccionada === obtenerSemanaActual();
    
    if (esSemanaActual) {
      // Guardar como métricas actuales de la campaña
      // Verificar si ya tiene métricas para advertir sobre sobrescritura
      if (campana.alcance || campana.clics || campana.leads || campana.costoSemanal) {
        const confirmar = window.confirm(
          `⚠️ Esta campaña ya tiene métricas guardadas.\n\n` +
          `¿Deseas sobrescribir las métricas existentes?\n\n` +
          `Métricas actuales:\n` +
          `- Alcance: ${campana.alcance || 0}\n` +
          `- Clics: ${campana.clics || 0}\n` +
          `- Leads: ${campana.leads || 0}\n` +
          `- Costo: $${campana.costoSemanal || 0}\n\n` +
          `Si continúas, estas métricas serán reemplazadas.`
        );
        
        if (!confirmar) {
          return;
        }
      }
      
      const resultado = await subirMetricasTrafficker({
        ...datos,
        alcance,
        clics,
        leads,
        costoSemanal: Number(datos.costoSemanal),
        costoLead: datos.costoLead ? Number(datos.costoLead) : undefined
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
        alcance,
        clics,
        leads,
        costoSemanal: Number(datos.costoSemanal),
        costoLead: datos.costoLead ? Number(datos.costoLead) : undefined,
        urlInforme: datos.urlInforme || undefined
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
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 Métricas del Trafficker</h2>
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 Seleccionar Semana
            </label>
            <select
              value={semanaSeleccionada}
              onChange={(e) => {
                const nuevaSemana = parseInt(e.target.value);
                setSemanaSeleccionada(nuevaSemana);
                // Cargar datos de la semana seleccionada si existen
                const datosSemana = historicoExistente.find(h => h.semanaISO === nuevaSemana);
                if (datosSemana) {
                  setValue('alcance', datosSemana.alcance || campana.alcance || 0);
                  setValue('clics', datosSemana.clics || campana.clics || 0);
                  setValue('leads', datosSemana.leads || campana.leads || 0);
                  // Usar el costo semanal de la semana específica
                  const costoSemanalSemana = datosSemana.costoSemanal || campana.costoSemanal || 0;
                  setValue('costoSemanal', costoSemanalSemana);
                  // Recalcular costo por lead con el costo semanal correcto
                  const leadsSemana = datosSemana.leads || campana.leads || 0;
                  if (costoSemanalSemana > 0 && leadsSemana > 0) {
                    setValue('costoLead', Math.round((costoSemanalSemana / leadsSemana) * 100) / 100);
                  } else {
                    setValue('costoLead', datosSemana.costoLead || campana.costoLead || 0);
                  }
                  setValue('urlInforme', datosSemana.urlInforme || campana.urlInforme || '');
                } else {
                  // Si no hay datos, usar datos actuales de la campaña
                  setValue('alcance', campana.alcance || 0);
                  setValue('clics', campana.clics || 0);
                  setValue('leads', campana.leads || 0);
                  // Para semana pasada sin datos, intentar obtener costo del histórico o usar el actual
                  const costoParaSemana = obtenerCostoSemanalParaCalculo();
                  setValue('costoSemanal', costoParaSemana);
                  setValue('costoLead', campana.costoLead);
                  setValue('urlInforme', campana.urlInforme || '');
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium"
            >
              {opcionesSemanas.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.label}
                </option>
              ))}
            </select>
            {semanaActualSeleccionada && (
              <p className="text-xs text-blue-600 mt-2">
                📆 Período: {semanaActualSeleccionada.rango}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              URL del Informe (opcional)
            </label>
            <input
              {...register('urlInforme')}
              type="url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="https://..."
            />
            {errors.urlInforme && (
              <p className="text-red-500 text-sm mt-1">{errors.urlInforme.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Alcance *
              </label>
              <input
                {...register('alcance', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="10000"
              />
              {errors.alcance && (
                <p className="text-red-500 text-sm mt-1">{errors.alcance.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Clics *
              </label>
              <input
                {...register('clics', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="500"
              />
              {errors.clics && (
                <p className="text-red-500 text-sm mt-1">{errors.clics.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Leads *
              </label>
              <input
                {...register('leads', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="50"
              />
              {errors.leads && (
                <p className="text-red-500 text-sm mt-1">{errors.leads.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Costo Semanal (USD) *
              </label>
              <input
                {...register('costoSemanal', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="2500.00"
              />
              {errors.costoSemanal && (
                <p className="text-red-500 text-sm mt-1">{errors.costoSemanal.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Costo/Lead (USD) <span className="text-xs text-gray-500 font-normal">(Calculado automáticamente)</span>
            </label>
            <input
              {...register('costoLead', { valueAsNumber: true })}
              type="number"
              readOnly
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed transition-all"
              placeholder="Se calcula automáticamente"
              title="Este valor se calcula automáticamente basado en el costo semanal y los leads"
            />
            <p className="text-gray-500 text-sm mt-1">
              Si no se especifica, se calculará automáticamente: Costo Semanal (USD) ÷ Leads
            </p>
            {semanaSeleccionada !== obtenerSemanaActual() && costoSemanalParaCalculo > 0 && (
              <p className="text-xs text-blue-600 mt-1 font-medium">
                💡 El cálculo usa el costo semanal de la semana {semanaSeleccionada}: ${costoSemanalParaCalculo} USD
              </p>
            )}
            {errors.costoLead && (
              <p className="text-red-500 text-sm mt-1">{errors.costoLead.message}</p>
            )}
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
              className="px-6 py-3 bg-success-500 hover:bg-success-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Guardando...' : 'Subir Métricas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


