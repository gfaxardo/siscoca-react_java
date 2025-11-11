import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampanaStore } from '../../store/useCampanaStore';
import { FormularioCrearCampana, VERTICALES_LABELS, PLATAFORMAS_LABELS, PAISES_LABELS, DUENOS, TIPOS_ATERRIZAJE_LABELS, Campana } from '../../types';
import { useState, useEffect, useRef } from 'react';

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
  segmento: z.enum(['Adquisición', 'Retención', 'Retorno', 'Más Vistas', 'Más Seguidores', 'Más Vistas del Perfil'], {
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
  detalleAterrizaje: z.string().optional(),
  nombrePlataforma: z.string().optional()
});

interface FormularioEditarCampanaProps {
  campana: Campana;
  onCerrar: () => void;
  modoLectura?: boolean; // Si es true, solo muestra los detalles sin permitir edición
}

const SEGMENTOS_ABREV: Record<string, string> = {
  'Adquisición': 'ADQ',
  'Retención': 'RET',
  'Retorno': 'RTO',
  'Más Vistas': 'VST',
  'Más Seguidores': 'SEG',
  'Más Vistas del Perfil': 'VDP'
};

function generarNombreCampana(
  pais: string,
  vertical: string,
  plataforma: string,
  segmento: string,
  inicialesDueno: string,
  descripcionCorta: string,
  idCampana: string
): string {
  if (!pais || !vertical || !plataforma || !segmento || !inicialesDueno || !descripcionCorta) {
    return '';
  }

  const segmentoAbrev = SEGMENTOS_ABREV[segmento] || 'XXX';
  const proximoId = idCampana.padStart(3, '0');
  return `${pais}-${vertical}-${plataforma}-${segmentoAbrev}-${proximoId}-${inicialesDueno.toUpperCase()}-${descripcionCorta}`;
}

export default function FormularioEditarCampanaComponent({ campana, onCerrar, modoLectura = false }: FormularioEditarCampanaProps) {
  const { actualizarCampana } = useCampanaStore();
  const nombreGeneradoInicial = generarNombreCampana(
    campana.pais,
    campana.vertical,
    campana.plataforma,
    campana.segmento || 'Adquisición',
    campana.inicialesDueno,
    campana.descripcionCorta,
    campana.id
  );
  const [nombreSugerido, setNombreSugerido] = useState<string>(nombreGeneradoInicial || campana.nombre);
  const nombreEditadoManualmenteRef = useRef<boolean>(
    nombreGeneradoInicial !== '' && campana.nombre !== nombreGeneradoInicial
  );
  
  // Asegurar que todos los valores de la campaña estén disponibles
  const valoresIniciales = {
    nombre: campana.nombre,
    pais: campana.pais,
    vertical: campana.vertical,
    plataforma: campana.plataforma,
    segmento: campana.segmento || 'Adquisición', // Valor por defecto si no existe
    idPlataformaExterna: campana.idPlataformaExterna || '',
    nombreDueno: campana.nombreDueno,
    inicialesDueno: campana.inicialesDueno,
    descripcionCorta: campana.descripcionCorta,
    objetivo: campana.objetivo || '',
    beneficio: campana.beneficio || '',
    descripcion: campana.descripcion || '',
    tipoAterrizaje: campana.tipoAterrizaje || 'FORMS', // Valor por defecto si no existe
    urlAterrizaje: campana.urlAterrizaje || '',
    detalleAterrizaje: campana.detalleAterrizaje || '',
    nombrePlataforma: campana.nombrePlataforma || ''
  };
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormularioCrearCampana>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: valoresIniciales
  });
  
  // Efecto para inicializar valores cuando cambia la campaña (solo una vez)
  useEffect(() => {
    if (campana) {
      // Establecer todos los valores iniciales
      setValue('nombre', campana.nombre, { shouldDirty: false });
      setValue('pais', campana.pais, { shouldDirty: false });
      setValue('vertical', campana.vertical, { shouldDirty: false });
      setValue('plataforma', campana.plataforma, { shouldDirty: false });
      setValue('segmento', campana.segmento || 'Adquisición', { shouldDirty: false });
      setValue('tipoAterrizaje', campana.tipoAterrizaje || 'FORMS', { shouldDirty: false });
      setValue('urlAterrizaje', campana.urlAterrizaje || '', { shouldDirty: false });
      setValue('detalleAterrizaje', campana.detalleAterrizaje || '', { shouldDirty: false });
      setValue('nombreDueno', campana.nombreDueno, { shouldDirty: false });
      setValue('inicialesDueno', campana.inicialesDueno, { shouldDirty: false });
      setValue('descripcionCorta', campana.descripcionCorta, { shouldDirty: false });
      setValue('objetivo', campana.objetivo || '', { shouldDirty: false });
      setValue('beneficio', campana.beneficio || '', { shouldDirty: false });
      setValue('descripcion', campana.descripcion || '', { shouldDirty: false });
      setValue('idPlataformaExterna', campana.idPlataformaExterna || '', { shouldDirty: false });
      setValue('nombrePlataforma', campana.nombrePlataforma || '', { shouldDirty: false });

      const sugerido = generarNombreCampana(
        campana.pais,
        campana.vertical,
        campana.plataforma,
        campana.segmento || 'Adquisición',
        campana.inicialesDueno,
        campana.descripcionCorta,
        campana.id
      );
      setNombreSugerido(sugerido || campana.nombre);
      // Marcar como editado manualmente si el nombre actual es diferente al sugerido
      nombreEditadoManualmenteRef.current = sugerido !== '' && campana.nombre !== sugerido;
    }
  }, [campana.id, setValue]); // Solo ejecutar cuando cambia el ID de la campaña

  const pais = watch('pais');
  const vertical = watch('vertical');
  const plataforma = watch('plataforma');
  const segmento = watch('segmento');
  const inicialesDueno = watch('inicialesDueno');
  const descripcionCorta = watch('descripcionCorta');
  const tipoAterrizaje = watch('tipoAterrizaje');
  const nombre = watch('nombre');
  

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

  // Actualizar nombre sugerido cuando cambian los campos, pero NO sobrescribir si el usuario está editando
  useEffect(() => {
    const sugerido = generarNombreCampana(
      pais,
      vertical,
      plataforma,
      segmento,
      inicialesDueno,
      descripcionCorta,
      campana.id
    );
    setNombreSugerido(sugerido || campana.nombre);
    // Solo actualizar automáticamente si el usuario NO ha editado manualmente el nombre
    if (!nombreEditadoManualmenteRef.current && sugerido) {
      setValue('nombre', sugerido, { shouldDirty: false });
    }
  }, [
    pais,
    vertical,
    plataforma,
    segmento,
    inicialesDueno,
    descripcionCorta,
    campana.id,
    setValue
  ]);

  const onSubmit = async (datos: FormularioCrearCampana) => {
    const resultado = await actualizarCampana(campana.id, datos);
    
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
              <h2 className="text-2xl font-bold">{modoLectura ? '👁️ Ver Detalles de Campaña' : '✏️ Editar Campaña'}</h2>
              <p className="text-primary-100 text-sm mt-1">{modoLectura ? 'Visualiza los detalles de la campaña' : 'Modifica los datos de la campaña'}</p>
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

        <form onSubmit={modoLectura ? (e) => { e.preventDefault(); } : handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Sección 1: Identificación */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏷️ Identificación de la Campaña</h3>
            
            {/* Nombre de la campaña */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Campaña *
              </label>
              <input
                {...register('nombre', {
                  minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                  onChange: (e) => {
                    nombreEditadoManualmenteRef.current = true;
                  }
                })}
                type="text"
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                placeholder="Ej: PE-MOTOPER-FB-ADQ-001-AC-BonoBienvenida"
              />
              {errors.nombre && (
                <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>
              )}
              {nombreSugerido && (
                <div className="flex items-center justify-between mt-2 bg-gray-100 border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-600">
                  <span>Sugerido: {nombreSugerido}</span>
                  {!modoLectura && (
                    <button
                      type="button"
                      onClick={() => {
                        nombreEditadoManualmenteRef.current = false;
                        setValue('nombre', nombreSugerido);
                      }}
                      className="text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Usar sugerido
                    </button>
                  )}
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
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                >
                  <option value="Adquisición">Adquisición</option>
                  <option value="Retención">Retención</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Más Vistas">Más Vistas</option>
                  <option value="Más Seguidores">Más Seguidores</option>
                  <option value="Más Vistas del Perfil">Más Vistas del Perfil</option>
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
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                  disabled={modoLectura || !inicialesCustomManual}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                  placeholder="Ej: ABC"
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
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
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
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                >
                  {Object.entries(TIPOS_ATERRIZAJE_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.tipoAterrizaje && (
                  <p className="text-red-500 text-sm mt-1">{errors.tipoAterrizaje.message}</p>
                )}
              </div>

              {/* Campo dinámico según tipo de aterrizaje */}
              <div>
                {(['FORMS', 'URL', 'LANDING', 'APP'].includes(tipoAterrizaje)) && (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL de Aterrizaje *
                    </label>
                    <input
                      {...register('urlAterrizaje', {
                        required: tipoAterrizaje === 'URL' || tipoAterrizaje === 'LANDING' || tipoAterrizaje === 'APP' ? 'La URL es requerida para este tipo de aterrizaje' : false,
                        pattern: {
                          value: /^https?:\/\/.+/,
                          message: 'Debe ser una URL válida (https://...)'
                        }
                      })}
                      type="url"
                      disabled={modoLectura}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                      placeholder="https://ejemplo.com/landing"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa la URL completa del formulario, landing page o app
                    </p>
                    {errors.urlAterrizaje && (
                      <p className="text-red-500 text-sm mt-1">{errors.urlAterrizaje.message}</p>
                    )}
                    {tipoAterrizaje === 'FORMS' && (
                      <>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 mt-4">
                          Detalles de Campos del Formulario (Opcional)
                        </label>
                        <textarea
                          {...register('detalleAterrizaje')}
                          rows={3}
                          disabled={modoLectura}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                          placeholder="Ej: Nombre, Email, Teléfono, Mensaje..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Describe qué campos tendrá el formulario de la landing de aterrizaje
                        </p>
                      </>
                    )}
                  </>
                )}

                {tipoAterrizaje === 'WHATSAPP' && (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de WhatsApp *
                    </label>
                    <input
                      {...register('urlAterrizaje', {
                        required: 'El número de WhatsApp es requerido',
                        pattern: {
                          value: /^\+?[1-9]\d{1,14}$/,
                          message: 'Debe ser un número de teléfono válido (ej: +51987654321)'
                        }
                      })}
                      type="tel"
                      disabled={modoLectura}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                      placeholder="+51987654321"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el número de WhatsApp con código de país (ej: +51987654321)
                    </p>
                    {errors.urlAterrizaje && (
                      <p className="text-red-500 text-sm mt-1">{errors.urlAterrizaje.message}</p>
                    )}
                  </>
                )}

                {tipoAterrizaje === 'EMAIL' && (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      {...register('urlAterrizaje', {
                        required: 'El correo electrónico es requerido',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Debe ser un correo electrónico válido'
                        }
                      })}
                      type="email"
                      disabled={modoLectura}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                      placeholder="contacto@empresa.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el correo electrónico de contacto
                    </p>
                    {errors.urlAterrizaje && (
                      <p className="text-red-500 text-sm mt-1">{errors.urlAterrizaje.message}</p>
                    )}
                  </>
                )}

                {tipoAterrizaje === 'CALL_CENTER' && (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Teléfono *
                    </label>
                    <input
                      {...register('urlAterrizaje', {
                        required: 'El número de teléfono es requerido',
                        pattern: {
                          value: /^\+?[1-9]\d{1,14}$/,
                          message: 'Debe ser un número de teléfono válido (ej: +51987654321)'
                        }
                      })}
                      type="tel"
                      disabled={modoLectura}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                      placeholder="+51987654321"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el número del call center con código de país
                    </p>
                    {errors.urlAterrizaje && (
                      <p className="text-red-500 text-sm mt-1">{errors.urlAterrizaje.message}</p>
                    )}
                  </>
                )}

                {tipoAterrizaje === 'OTRO' && (
                  <>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Información de Aterrizaje (Opcional)
                    </label>
                    <input
                      {...register('urlAterrizaje')}
                      type="text"
                      disabled={modoLectura}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-50"
                      placeholder="Describe o ingresa la información del aterrizaje"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa cualquier información adicional sobre el aterrizaje
                    </p>
                    {errors.urlAterrizaje && (
                      <p className="text-red-500 text-sm mt-1">{errors.urlAterrizaje.message}</p>
                    )}
                  </>
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
              {modoLectura ? 'Cerrar' : 'Cancelar'}
            </button>
            {!modoLectura && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
