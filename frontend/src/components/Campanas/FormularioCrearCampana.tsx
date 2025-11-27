import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCampanaStore } from '../../store/useCampanaStore';
import { FormularioCrearCampana, VERTICALES_LABELS, PLATAFORMAS_LABELS, PAISES_LABELS, DUENOS, TIPOS_ATERRIZAJE_LABELS } from '../../types';
import { useState, useEffect } from 'react';
import { X, Target, Globe, BarChart3, Smartphone, User, FileText, MapPin, Edit3, Check } from 'lucide-react';

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

interface FormularioCrearCampanaProps {
  onCerrar: () => void;
}

const SEGMENTOS_ABREV: Record<string, string> = {
  'Adquisición': 'ADQ',
  'Retención': 'RET',
  'Retorno': 'RTO',
  'Más Vistas': 'VST',
  'Más Seguidores': 'SEG',
  'Más Vistas del Perfil': 'VDP'
};

export default function FormularioCrearCampanaComponent({ onCerrar }: FormularioCrearCampanaProps) {
  const { crearCampana, campanas, obtenerCampanas } = useCampanaStore();
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
  
  // Sincronizar parámetros al cambiar tipo de aterrizaje
  useEffect(() => {
    // Cuando cambia el tipo de aterrizaje, limpiar el campo urlAterrizaje para evitar valores incorrectos
    if (tipoAterrizaje) {
      const valorActual = watch('urlAterrizaje');
      // Solo limpiar si el valor actual no es válido para el nuevo tipo
      if (tipoAterrizaje === 'EMAIL' && valorActual && !valorActual.includes('@')) {
        setValue('urlAterrizaje', '');
      } else if (tipoAterrizaje === 'WHATSAPP' && valorActual && valorActual.includes('@')) {
        setValue('urlAterrizaje', '');
      } else if (tipoAterrizaje === 'CALL_CENTER' && valorActual && valorActual.includes('@')) {
        setValue('urlAterrizaje', '');
      } else if (['FORMS', 'URL', 'LANDING', 'APP'].includes(tipoAterrizaje) && valorActual && !valorActual.startsWith('http') && valorActual.length > 0) {
        // Si cambia de tipo que no requiere URL a uno que sí, limpiar
        if (!['FORMS', 'URL', 'LANDING', 'APP'].includes(valorActual)) {
          setValue('urlAterrizaje', '');
        }
      }
    }
  }, [tipoAterrizaje, setValue, watch]);

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
      await obtenerCampanas();
      onCerrar();
    } else {
      alert(`❌ ${resultado.mensaje}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header moderno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white px-6 lg:px-8 py-5 lg:py-6 flex justify-between items-center flex-shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold">Crear Nueva Campaña</h2>
              <p className="text-sm text-gray-400">Completa los datos para generar tu campaña</p>
            </div>
          </div>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Cerrar formulario"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenedor con scroll interno */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit(onSubmit)} className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Preview del nombre generado */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 shadow">
            <div className="flex justify-between items-center mb-3">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                Nombre de Campaña {esEditable ? '(Personalizado)' : '(Generado Automáticamente)'}
              </label>
              <button
                type="button"
                onClick={() => {
                  if (esEditable) {
                    setEsEditable(false);
                    setNombreEditando(nombreGenerado);
                  } else {
                    setEsEditable(true);
                    setNombreEditando(nombreGenerado);
                  }
                }}
                className="text-gray-600 hover:text-primary-600 transition-colors p-2 hover:bg-white rounded-lg"
                title={esEditable ? 'Restaurar nombre automático' : 'Personalizar nombre'}
              >
                {esEditable ? <Check className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
              </button>
            </div>
            {esEditable ? (
              <input
                type="text"
                value={nombreEditando}
                onChange={(e) => setNombreEditando(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm lg:text-base font-bold text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400"
                placeholder="Ingresa el nombre personalizado..."
              />
            ) : (
              <div className="bg-white rounded-lg p-4 font-mono text-sm lg:text-base font-bold text-gray-900 break-all border border-gray-200">
                {nombreGenerado}
              </div>
            )}
          </div>

          {/* Sección 1: Datos de Identificación */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow">
            <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#ef0000' }} />
              Datos de Identificación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" style={{ color: '#ef0000' }} />
                  País *
                </label>
                <select
                  {...register('pais')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                >
                  {Object.entries(PAISES_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.pais && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.pais.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Vertical *
                </label>
                <select
                  {...register('vertical')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {Object.entries(VERTICALES_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.vertical && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.vertical.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Plataforma *
                </label>
                <select
                  {...register('plataforma')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {Object.entries(PLATAFORMAS_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.plataforma && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.plataforma.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Segmento *
                </label>
                <select
                  {...register('segmento')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Adquisición">Adquisición</option>
                  <option value="Retención">Retención</option>
                  <option value="Retorno">Retorno</option>
                  <option value="Más Vistas">Más Vistas</option>
                  <option value="Más Seguidores">Más Seguidores</option>
                  <option value="Más Vistas del Perfil">Más Vistas del Perfil</option>
                </select>
                {errors.segmento && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.segmento.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#ef0000' }} />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
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
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.nombreDueno.message}</p>
                )}
              </div>

              {inicialesCustomManual && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                    Iniciales Personalizadas *
                  </label>
                  <input
                    {...register('inicialesDueno')}
                    type="text"
                    maxLength={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 uppercase bg-white font-medium text-sm"
                    placeholder="XX"
                  />
                  <p className="text-gray-600 text-xs mt-1 font-medium">
                    Solo si seleccionaste "Otro"
                  </p>
                  {errors.inicialesDueno && (
                    <p className="text-red-600 text-xs mt-1 font-medium">{errors.inicialesDueno.message}</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  ID Plataforma (Opcional)
                </label>
                <input
                  {...register('idPlataformaExterna')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                  placeholder="123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Nombre en Plataforma (Opcional)
                </label>
                <input
                  {...register('nombrePlataforma')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                  placeholder="Ej: Rayo - Bono Bienvenida"
                />
                <p className="text-xs text-gray-600 mt-1 font-medium">
                  Nombre que aparece en Facebook/TikTok/Google
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                Descripción Corta *
              </label>
              <input
                {...register('descripcionCorta')}
                type="text"
                maxLength={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                placeholder="Verano2025"
              />
              <p className="text-gray-600 text-xs mt-1 font-medium">
                Sin espacios, máximo 20 caracteres (ej: Verano2025, BlackFriday, Promo50)
              </p>
              {errors.descripcionCorta && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.descripcionCorta.message}</p>
              )}
            </div>
          </div>

          {/* Sección 2: Información de la Campaña */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow">
            <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#ef0000' }} />
              Información de la Campaña
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: '#ef0000' }} />
                Objetivo de la Campaña *
              </label>
              <textarea
                {...register('objetivo')}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm resize-none"
                placeholder="Describe el objetivo principal de esta campaña..."
              />
              {errors.objetivo && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.objetivo.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: '#ef0000' }} />
                Beneficio/Programa *
              </label>
              <input
                {...register('beneficio')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                placeholder="Ej: Bono de bienvenida $200 USD"
              />
              {errors.beneficio && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.beneficio.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                Descripción Detallada *
              </label>
              <textarea
                {...register('descripcion')}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm resize-none"
                placeholder="Describe detalladamente la campaña, público objetivo, estrategia, etc..."
              />
              {errors.descripcion && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.descripcion.message}</p>
              )}
            </div>
          </div>

          {/* Sección 4: Aterrizaje de la Campaña */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow">
            <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: '#ef0000' }} />
              Aterrizaje de la Campaña
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Tipo de Aterrizaje *
                </label>
                <select
                  {...register('tipoAterrizaje')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
                >
                  {Object.entries(TIPOS_ATERRIZAJE_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.tipoAterrizaje && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.tipoAterrizaje.message}</p>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all hover:border-gray-400 bg-white font-medium text-sm"
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

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCerrar}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              style={{ background: isSubmitting ? '#9ca3af' : 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5" />
                  Crear Campaña
                </>
              )}
            </button>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}
