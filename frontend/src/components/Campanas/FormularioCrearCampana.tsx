import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampanaStore } from '../../store/useCampanaStore';
import { FormularioCrearCampana, VERTICALES_LABELS, PLATAFORMAS_LABELS, PAISES_LABELS, DUENOS } from '../../types';
import { useState, useEffect } from 'react';

const esquemaFormulario = z.object({
  pais: z.enum(['PE', 'CO'], {
    errorMap: () => ({ message: 'Selecciona un país' })
  }),
  vertical: z.enum(['MOTOPER', 'MOTODEL', 'CARGO', 'AUTOPER', 'B2B', 'PREMIER', 'CONFORT', 'YEGOPRO', 'YEGOMIAUTO', 'YEGOMIMOTO'], {
    errorMap: () => ({ message: 'Selecciona una vertical válida' })
  }),
  plataforma: z.enum(['FB', 'TT', 'IG', 'GG', 'LI'], {
    errorMap: () => ({ message: 'Selecciona una plataforma' })
  }),
  segmento: z.enum(['Adquisición', 'Retención', 'Retorno'], {
    errorMap: () => ({ message: 'Selecciona un segmento válido' })
  }),
  idPlataformaExterna: z.string().optional(),
  nombreDueno: z.string().min(1, 'Selecciona un dueño'),
  inicialesDueno: z.string(),
  descripcionCorta: z.string()
    .min(3, 'Mínimo 3 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9]+$/, 'Sin espacios ni caracteres especiales'),
  objetivo: z.string().min(10, 'El objetivo debe tener al menos 10 caracteres'),
  beneficio: z.string().min(2, 'El beneficio/programa es requerido'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres')
});

interface FormularioCrearCampanaProps {
  onCerrar: () => void;
}

const SEGMENTOS_ABREV: Record<string, string> = {
  'Adquisición': 'ADQ',
  'Retención': 'RET',
  'Retorno': 'RTO'
};

export default function FormularioCrearCampanaComponent({ onCerrar }: FormularioCrearCampanaProps) {
  const { crearCampana, campanas } = useCampanaStore();
  const [nombreGenerado, setNombreGenerado] = useState<string>('');
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormularioCrearCampana>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      pais: 'PE',
      idPlataformaExterna: '',
      inicialesDueno: ''
    }
  });

  const pais = watch('pais');
  const vertical = watch('vertical');
  const plataforma = watch('plataforma');
  const segmento = watch('segmento');
  const inicialesDueno = watch('inicialesDueno');
  const descripcionCorta = watch('descripcionCorta');

  const [inicialesCustomManual, setInicialesCustomManual] = useState(false);

  const manejarCambioDueno = (nombreSeleccionado: string) => {
    const dueno = DUENOS.find(d => d.nombre === nombreSeleccionado);
    
    if (dueno) {
      if (dueno.nombre === 'Otro') {
        setInicialesCustomManual(true);
      } else {
        setInicialesCustomManual(false);
      }
    }
  };

  useEffect(() => {
    if (pais && vertical && plataforma && segmento && inicialesDueno && descripcionCorta) {
      const segmentoAbrev = SEGMENTOS_ABREV[segmento] || 'XXX';
      const proximoId = (campanas.length + 1).toString().padStart(3, '0');
      const nombre = `${pais}-${vertical}-${plataforma}-${segmentoAbrev}-${proximoId}-${inicialesDueno.toUpperCase()}-${descripcionCorta}`;
      setNombreGenerado(nombre);
    } else {
      setNombreGenerado('Completa los campos para generar el nombre...');
    }
  }, [pais, vertical, plataforma, segmento, inicialesDueno, descripcionCorta, campanas.length]);

  const onSubmit = async (datos: FormularioCrearCampana) => {
    const resultado = await crearCampana(datos);
    
    if (resultado.exito) {
      alert(`✅ ${resultado.mensaje}`);
      onCerrar();
    } else {
      alert(`❌ ${resultado.mensaje}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
          <h2 className="text-2xl font-bold text-gray-900">🎯 Crear Nueva Campaña</h2>
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
          {/* Preview del nombre generado */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-4">
            <label className="block text-sm font-semibold text-primary-700 mb-2">
              📝 Nombre de Campaña (Generado Automáticamente)
            </label>
            <div className="bg-white rounded-lg p-4 font-mono text-lg font-bold text-primary-900 break-all">
              {nombreGenerado}
            </div>
          </div>

          {/* Sección 1: Datos de Identificación */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Datos de Identificación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  País *
                </label>
                <select
                  {...register('pais')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {Object.entries(PAISES_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.pais && (
                  <p className="text-red-500 text-sm mt-1">{errors.pais.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vertical *
                </label>
                <select
                  {...register('vertical')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar...</option>
                  {Object.entries(VERTICALES_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.vertical && (
                  <p className="text-red-500 text-sm mt-1">{errors.vertical.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plataforma *
                </label>
                <select
                  {...register('plataforma')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar...</option>
                  {Object.entries(PLATAFORMAS_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.plataforma && (
                  <p className="text-red-500 text-sm mt-1">{errors.plataforma.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Segmento *
                </label>
                <select
                  {...register('segmento')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Adquisición">Adquisición</option>
                  <option value="Retención">Retención</option>
                  <option value="Retorno">Retorno</option>
                </select>
                {errors.segmento && (
                  <p className="text-red-500 text-sm mt-1">{errors.segmento.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dueño de Campaña *
                </label>
                <select
                  {...register('nombreDueno')}
                  onChange={(e) => {
                    const dueno = DUENOS.find(d => d.nombre === e.target.value);
                    if (dueno) {
                      manejarCambioDueno(dueno.nombre);
                      if (dueno.iniciales) {
                        setValue('inicialesDueno', dueno.iniciales);
                      }
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Seleccionar...</option>
                  {DUENOS.map((dueno) => (
                    <option key={dueno.nombre} value={dueno.nombre}>
                      {dueno.nombre}
                      {dueno.iniciales && ` (${dueno.iniciales})`}
                    </option>
                  ))}
                </select>
                {errors.nombreDueno && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombreDueno.message}</p>
                )}
              </div>

              {inicialesCustomManual && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Iniciales Personalizadas *
                  </label>
                  <input
                    {...register('inicialesDueno')}
                    type="text"
                    maxLength={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all uppercase"
                    placeholder="XX"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Solo si seleccionaste "Otro"
                  </p>
                  {errors.inicialesDueno && (
                    <p className="text-red-500 text-sm mt-1">{errors.inicialesDueno.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID Plataforma (Opcional)
                </label>
                <input
                  {...register('idPlataformaExterna')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción Corta *
              </label>
              <input
                {...register('descripcionCorta')}
                type="text"
                maxLength={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Verano2025"
              />
              <p className="text-gray-500 text-xs mt-1">
                Sin espacios, máximo 20 caracteres (ej: Verano2025, BlackFriday, Promo50)
              </p>
              {errors.descripcionCorta && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcionCorta.message}</p>
              )}
            </div>
          </div>

          {/* Sección 2: Información de la Campaña */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📄 Información de la Campaña</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Objetivo de la Campaña *
              </label>
              <textarea
                {...register('objetivo')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Describe el objetivo principal de esta campaña..."
              />
              {errors.objetivo && (
                <p className="text-red-500 text-sm mt-1">{errors.objetivo.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Beneficio/Programa *
              </label>
              <input
                {...register('beneficio')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Ej: Bono de bienvenida $200 USD"
              />
              {errors.beneficio && (
                <p className="text-red-500 text-sm mt-1">{errors.beneficio.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción Detallada *
              </label>
              <textarea
                {...register('descripcion')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Describe detalladamente la campaña, público objetivo, estrategia, etc..."
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
              )}
            </div>
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
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creando...' : 'Crear Campaña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
