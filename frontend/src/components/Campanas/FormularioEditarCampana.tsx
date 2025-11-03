import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampanaStore } from '../../store/useCampanaStore';
import { FormularioCrearCampana, VERTICALES_LABELS, PLATAFORMAS_LABELS, PAISES_LABELS, DUENOS, TIPOS_ATERRIZAJE_LABELS, Campana } from '../../types';
import { useState, useEffect } from 'react';

const esquemaFormulario = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
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
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  tipoAterrizaje: z.enum(['FORMS', 'WHATSAPP', 'URL', 'LANDING', 'APP', 'CALL_CENTER', 'EMAIL', 'OTRO'], {
    errorMap: () => ({ message: 'Selecciona un tipo de aterrizaje' })
  }),
  urlAterrizaje: z.string().optional(),
  nombrePlataforma: z.string().optional()
});

interface FormularioEditarCampanaProps {
  campana: Campana;
  onCerrar: () => void;
}

const SEGMENTOS_ABREV: Record<string, string> = {
  'Adquisición': 'ADQ',
  'Retención': 'RET',
  'Retorno': 'RTO'
};

export default function FormularioEditarCampanaComponent({ campana, onCerrar }: FormularioEditarCampanaProps) {
  const { actualizarCampana } = useCampanaStore();
  const [nombreGenerado, setNombreGenerado] = useState<string>(campana.nombre);
  const [nombrePersonalizado, setNombrePersonalizado] = useState<string>(campana.nombre);
  const [usarNombrePersonalizado, setUsarNombrePersonalizado] = useState<boolean>(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormularioCrearCampana>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      pais: campana.pais,
      vertical: campana.vertical,
      plataforma: campana.plataforma,
      segmento: campana.segmento,
      idPlataformaExterna: campana.idPlataformaExterna || '',
      nombreDueno: campana.nombreDueno,
      inicialesDueno: campana.inicialesDueno,
      descripcionCorta: campana.descripcionCorta,
      objetivo: campana.objetivo,
      beneficio: campana.beneficio,
      descripcion: campana.descripcion,
      tipoAterrizaje: campana.tipoAterrizaje,
      urlAterrizaje: campana.urlAterrizaje || '',
      nombrePlataforma: campana.nombrePlataforma || ''
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
        setValue('inicialesDueno', dueno.iniciales);
      }
    }
  };

  // Generar nombre automático cuando cambien los campos
  useEffect(() => {
    if (pais && vertical && plataforma && segmento && inicialesDueno && descripcionCorta) {
      const segmentoAbrev = SEGMENTOS_ABREV[segmento] || 'XXX';
      const proximoId = campana.id.padStart(3, '0');
      const nombre = `${pais}-${vertical}-${plataforma}-${segmentoAbrev}-${proximoId}-${inicialesDueno.toUpperCase()}-${descripcionCorta}`;
      setNombreGenerado(nombre);
    }
  }, [pais, vertical, plataforma, segmento, inicialesDueno, descripcionCorta, campana.id]);

  const onSubmit = async (datos: FormularioCrearCampana) => {
    const nombreParaEnviar = usarNombrePersonalizado ? nombrePersonalizado : nombreGenerado;
    const datosFinales = {
      ...datos,
      nombre: nombreParaEnviar
    };

    const resultado = await actualizarCampana(campana.id, datosFinales);
    
    if (resultado.exito) {
      alert(`✅ ${resultado.mensaje}`);
      onCerrar();
    } else {
      alert(`❌ ${resultado.mensaje}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">✏️ Editar Campaña</h2>
              <p className="text-primary-100 text-sm mt-1">Modifica los datos de la campaña</p>
            </div>
            <button
              onClick={onCerrar}
              className="text-white hover:text-primary-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Sección 1: Identificación */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏷️ Identificación de la Campaña</h3>
            
            {/* Nombre de la campaña */}
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <input
                  type="checkbox"
                  id="usarNombrePersonalizado"
                  checked={usarNombrePersonalizado}
                  onChange={(e) => setUsarNombrePersonalizado(e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="usarNombrePersonalizado" className="text-sm font-semibold text-gray-700">
                  Usar nombre personalizado
                </label>
              </div>
              
              {usarNombrePersonalizado ? (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Personalizado *
                  </label>
                  <input
                    type="text"
                    value={nombrePersonalizado}
                    onChange={(e) => setNombrePersonalizado(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="Ingresa el nombre personalizado..."
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Generado Automáticamente
                  </label>
                  <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                    {nombreGenerado || 'Completa los campos para generar el nombre...'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    El nombre se genera automáticamente basado en los campos seleccionados
                  </p>
                </div>
              )}
            </div>

            {/* País */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {/* Vertical */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vertical *
                </label>
                <select
                  {...register('vertical')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {Object.entries(VERTICALES_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.vertical && (
                  <p className="text-red-500 text-sm mt-1">{errors.vertical.message}</p>
                )}
              </div>
            </div>

            {/* Plataforma y Segmento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Plataforma *
                </label>
                <select
                  {...register('plataforma')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {Object.entries(PLATAFORMAS_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.plataforma && (
                  <p className="text-red-500 text-sm mt-1">{errors.plataforma.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Segmento *
                </label>
                <select
                  {...register('segmento')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="Adquisición">Adquisición</option>
                  <option value="Retención">Retención</option>
                  <option value="Retorno">Retorno</option>
                </select>
                {errors.segmento && (
                  <p className="text-red-500 text-sm mt-1">{errors.segmento.message}</p>
                )}
              </div>
            </div>

            {/* ID Plataforma Externa y Nombre en Plataforma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID Plataforma Externa (Opcional)
                </label>
                <input
                  {...register('idPlataformaExterna')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Ej: 123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre en Plataforma (Opcional)
                </label>
                <input
                  {...register('nombrePlataforma')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Ej: Rayo - Bono Bienvenida"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nombre que aparece en Facebook/TikTok/Google
                </p>
              </div>
            </div>
          </div>

          {/* Sección 2: Dueño */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Dueño de la Campaña</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Dueño *
                </label>
                <select
                  {...register('nombreDueno')}
                  onChange={(e) => {
                    register('nombreDueno').onChange(e);
                    manejarCambioDueno(e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {DUENOS.map((dueno) => (
                    <option key={dueno.nombre} value={dueno.nombre}>{dueno.nombre}</option>
                  ))}
                </select>
                {errors.nombreDueno && (
                  <p className="text-red-500 text-sm mt-1">{errors.nombreDueno.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Iniciales *
                </label>
                <input
                  {...register('inicialesDueno')}
                  type="text"
                  maxLength={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="Ej: ABC"
                  disabled={!inicialesCustomManual}
                />
                {errors.inicialesDueno && (
                  <p className="text-red-500 text-sm mt-1">{errors.inicialesDueno.message}</p>
                )}
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
                placeholder="Ej: BonoBienvenida"
              />
              {errors.descripcionCorta && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcionCorta.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Sin espacios ni caracteres especiales (máximo 20 caracteres)
              </p>
            </div>
          </div>

          {/* Sección 3: Información de la Campaña */}
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
                placeholder="Describe detalladamente la campaña, incluyendo estrategia, público objetivo, etc..."
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
              )}
            </div>
          </div>

          {/* Sección 4: Aterrizaje de la Campaña */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Aterrizaje de la Campaña</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Aterrizaje *
                </label>
                <select
                  {...register('tipoAterrizaje')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {Object.entries(TIPOS_ATERRIZAJE_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.tipoAterrizaje && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipoAterrizaje.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL de Aterrizaje (Opcional)
                </label>
                <input
                  {...register('urlAterrizaje')}
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="https://ejemplo.com/landing"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Solo para tipos: URL, Landing Page, App
                </p>
                {errors.urlAterrizaje && (
                  <p className="text-red-500 text-sm mt-1">{errors.urlAterrizaje.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
