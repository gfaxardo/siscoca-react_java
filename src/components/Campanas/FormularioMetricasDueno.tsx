import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana, MetricasDueno } from '../../types';

const esquemaFormulario = z.object({
  idCampana: z.string(),
  conductoresRegistrados: z.number().min(0, 'Debe ser un número positivo'),
  conductoresPrimerViaje: z.number().min(0, 'Debe ser un número positivo')
});

interface FormularioMetricasDuenoProps {
  campana: Campana;
  onCerrar: () => void;
}

export default function FormularioMetricasDuenoComponent({ campana, onCerrar }: FormularioMetricasDuenoProps) {
  const { completarMetricasDueno } = useCampanaStore();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MetricasDueno>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      idCampana: campana.id,
      conductoresRegistrados: campana.conductoresRegistrados || 0,
      conductoresPrimerViaje: campana.conductoresPrimerViaje || 0
    }
  });

  const onSubmit = async (datos: MetricasDueno) => {
    const resultado = await completarMetricasDueno({
      ...datos,
      conductoresRegistrados: Number(datos.conductoresRegistrados),
      conductoresPrimerViaje: Number(datos.conductoresPrimerViaje)
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Conductores Registrados *
            </label>
            <input
              {...register('conductoresRegistrados', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent transition-all text-lg"
              placeholder="0"
            />
            {errors.conductoresRegistrados && (
              <p className="text-red-500 text-sm mt-1">{errors.conductoresRegistrados.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Conductores con Primer Viaje *
            </label>
            <input
              {...register('conductoresPrimerViaje', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-warning-500 focus:border-transparent transition-all text-lg"
              placeholder="0"
            />
            {errors.conductoresPrimerViaje && (
              <p className="text-red-500 text-sm mt-1">{errors.conductoresPrimerViaje.message}</p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Nota:</span> El sistema calculará automáticamente:
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1 ml-4">
              <li>• Costo por Conductor Registrado</li>
              <li>• Costo por Conductor con Primer Viaje</li>
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


