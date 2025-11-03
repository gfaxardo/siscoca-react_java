import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampanaStore } from '../../store/useCampanaStore';
import { FormularioCrearCampana, VERTICALES_LABELS, PLATAFORMAS_LABELS, PAISES_LABELS, DUENOS, TIPOS_ATERRIZAJE_LABELS } from '../../types';
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
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  tipoAterrizaje: z.enum(['FORMS', 'WHATSAPP', 'URL', 'LANDING', 'APP', 'CALL_CENTER', 'EMAIL', 'OTRO'], {
    errorMap: () => ({ message: 'Selecciona un tipo de aterrizaje' })
  }),
  urlAterrizaje: z.string().optional(),
  nombrePlataforma: z.string().optional()
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
  const [nombreEditando, setNombreEditando] = useState<string>('');
  const [esEditable, setEsEditable] = useState(false);
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormularioCrearCampana>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      pais: 'PE',
      idPlataformaExterna: '',
      inicialesDueno: '',
      tipoAterrizaje: 'FORMS'
    }
  });

  const pais = watch('pais');
  const vertical = watch('vertical');
  const plataforma = watch('plataforma');
  const segmento = watch('segmento');
  const inicialesDueno = watch('inicialesDueno');
  const descripcionCorta = watch('descripcionCorta');
  const tipoAterrizaje = watch('tipoAterrizaje');

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
      // Actualizar el nombre en edición solo si está en modo automático (no editable)
      if (!esEditable) {
        setNombreEditando(nombre);
      }
    } else {
      setNombreGenerado('Completa los campos para generar el nombre...');
      if (!esEditable) {
        setNombreEditando('Completa los campos para generar el nombre...');
      }
    }
  }, [pais, vertical, plataforma, segmento, inicialesDueno, descripcionCorta, campanas.length, esEditable]);

  const onSubmit = async (datos: FormularioCrearCampana) => {
    // Usar el nombre editado si está en modo manual, sino usar el generado
    const nombreFinal = esEditable && nombreEditando.trim() ? nombreEditando : nombreGenerado;
    
    if (!nombreFinal || nombreFinal === 'Completa los campos para generar el nombre...') {
      alert('❌ Por favor completa todos los campos requeridos para generar el nombre de la campaña');
      return;
    }
    
    const resultado = await crearCampana(datos, nombreFinal);
    
    if (resultado.exito) {
      alert(`✅ ${resultado.mensaje}`);
      onCerrar();
    } else {
      alert(`❌ ${resultado.mensaje}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header fijo sin sticky */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 lg:px-6 lg:py-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
          <h2 className="text-lg lg:text-2xl font-bold">🎯 Crear Nueva Campaña</h2>
          <button
            onClick={onCerrar}
            className="text-white hover:text-primary-200 transition-colors"
            aria-label="Cerrar formulario"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenedor con scroll interno */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Preview del nombre generado */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-3">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs lg:text-sm font-semibold text-primary-700">
                📝 Nombre de Campaña {esEditable ? '(Personalizado)' : '(Generado Automáticamente)'}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (esEditable) {
                    // Volver a modo automático
                    setEsEditable(false);
                    setNombreEditando(nombreGenerado);
                  } else {
                    // Cambiar a modo manual
                    setEsEditable(true);
                    setNombreEditando(nombreGenerado);
                  }
                }}
                className="text-primary-600 hover:text-primary-800 transition-colors p-1"
                title={esEditable ? 'Restaurar nombre automático' : 'Personalizar nombre'}
              >
                {esEditable ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </button>
            </div>
            {esEditable ? (
              <input
                type="text"
                value={nombreEditando}
                onChange={(e) => setNombreEditando(e.target.value)}
                className="w-full px-4 py-3 border-2 border-primary-400 rounded-lg font-mono text-sm lg:text-lg font-bold text-primary-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Ingresa el nombre personalizado..."
              />
            ) : (
              <div className="bg-white rounded-lg p-3 font-mono text-sm lg:text-lg font-bold text-primary-900 break-all">
                {nombreGenerado}
              </div>
            )}
          </div>

          {/* Sección 1: Datos de Identificación */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="text-sm lg:text-lg font-bold text-gray-900 mb-3">📋 Datos de Identificación</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                      placeholder="https://ejemplo.com/landing"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa la URL completa del formulario, landing page o app
                    </p>
                    {errors.urlAterrizaje && (
                      <p className="text-red-500 text-sm mt-1">{errors.urlAterrizaje.message}</p>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
    </div>
  );
}
