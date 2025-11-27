import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana, MetricasTrafficker } from '../../types';
import { subWeeks, startOfWeek, endOfWeek, format, getYear, getISOWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  BarChart3, 
  X, 
  Save, 
  Calendar, 
  Link2, 
  MousePointer, 
  Target, 
  DollarSign, 
  Loader2 
} from 'lucide-react';

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

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 flex justify-between items-center flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl lg:text-2xl font-bold text-white">
                Métricas del Trafficker
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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" style={{ color: '#ef0000' }} />
                Seleccionar Semana
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
            >
              {opcionesSemanas.map((opcion) => (
                <option key={opcion.valor} value={opcion.valor}>
                  {opcion.label}
                </option>
              ))}
            </select>
            {semanaActualSeleccionada && (
              <p className="text-xs text-blue-700 mt-2 font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Período: {semanaActualSeleccionada.rango}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Link2 className="w-4 h-4" style={{ color: '#ef0000' }} />
              URL del Informe (opcional)
            </label>
            <input
              {...register('urlInforme')}
              type="url"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
              placeholder="https://..."
            />
            {errors.urlInforme && (
              <p className="text-red-600 text-xs mt-1 font-medium">{errors.urlInforme.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: '#ef0000' }} />
                Alcance *
              </label>
              <input
                {...register('alcance', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
                placeholder="10000"
              />
              {errors.alcance && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.alcance.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MousePointer className="w-4 h-4" style={{ color: '#ef0000' }} />
                Clics *
              </label>
              <input
                {...register('clics', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
                placeholder="500"
              />
              {errors.clics && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.clics.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: '#ef0000' }} />
                Leads *
              </label>
              <input
                {...register('leads', { valueAsNumber: true })}
                type="number"
                min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
                placeholder="50"
              />
              {errors.leads && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.leads.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" style={{ color: '#ef0000' }} />
                Costo Semanal (USD) *
              </label>
              <input
                {...register('costoSemanal', { valueAsNumber: true })}
                type="number"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium hover:border-gray-400"
                placeholder="2500.00"
              />
              {errors.costoSemanal && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.costoSemanal.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4" style={{ color: '#ef0000' }} />
              Costo/Lead (USD) <span className="text-xs text-gray-500 font-normal ml-auto">(Calculado automáticamente)</span>
            </label>
            <input
              {...register('costoLead', { valueAsNumber: true })}
              type="number"
              readOnly
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed transition-all font-medium"
              placeholder="Se calcula automáticamente"
              title="Este valor se calcula automáticamente basado en el costo semanal y los leads"
            />
            <p className="text-gray-600 text-xs mt-2 font-medium">
              Fórmula: Costo Semanal (USD) ÷ Leads
            </p>
            {semanaSeleccionada !== obtenerSemanaActual() && costoSemanalParaCalculo > 0 && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700 font-bold flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  El cálculo usa el costo semanal de la semana {semanaSeleccionada}: ${costoSemanalParaCalculo} USD
                </p>
              </div>
            )}
            {errors.costoLead && (
              <p className="text-red-600 text-xs mt-1 font-medium">{errors.costoLead.message}</p>
            )}
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
                  Subir Métricas
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


