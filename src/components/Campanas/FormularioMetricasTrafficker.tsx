import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana, MetricasTrafficker } from '../../types';

const esquemaFormulario = z.object({
  idCampana: z.string(),
  urlInforme: z.string().url('URL inválida').optional().or(z.literal('')),
  alcance: z.number().min(0, 'El alcance debe ser positivo'),
  clics: z.number().min(0, 'Los clics deben ser positivos'),
  leads: z.number().min(0, 'Los leads deben ser positivos'),
  costoSemanal: z.number().min(0, 'El costo debe ser positivo'),
  costoLead: z.number().min(0).optional()
});

interface FormularioMetricasTraffickerProps {
  campana: Campana;
  onCerrar: () => void;
}

export default function FormularioMetricasTraffickerComponent({ campana, onCerrar }: FormularioMetricasTraffickerProps) {
  const { subirMetricasTrafficker } = useCampanaStore();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MetricasTrafficker>({
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

  const onSubmit = async (datos: MetricasTrafficker) => {
    const resultado = await subirMetricasTrafficker({
      ...datos,
      alcance: Number(datos.alcance),
      clics: Number(datos.clics),
      leads: Number(datos.leads),
      costoSemanal: Number(datos.costoSemanal),
      costoLead: datos.costoLead ? Number(datos.costoLead) : undefined
    });
    
    if (resultado.exito) {
      alert(`✅ ${resultado.mensaje}`);
      onCerrar();
    } else {
      alert(`❌ ${resultado.mensaje}`);
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
                Costo Semanal (S/) *
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
              Costo/Lead (S/) - Opcional
            </label>
            <input
              {...register('costoLead', { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              placeholder="Se calcula automáticamente"
            />
            <p className="text-gray-500 text-sm mt-1">
              Si no se especifica, se calculará automáticamente: Costo Semanal ÷ Leads
            </p>
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


