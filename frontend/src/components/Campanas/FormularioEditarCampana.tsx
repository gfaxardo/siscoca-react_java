import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPortal } from 'react-dom';
import { useCampanaStore } from '../../store/useCampanaStore';
import { FormularioCrearCampana, VERTICALES_LABELS, PLATAFORMAS_LABELS, PAISES_LABELS, DUENOS, TIPOS_ATERRIZAJE_LABELS, Campana } from '../../types';
import { useState, useEffect, useRef } from 'react';
import { 
  Eye, 
  Edit3, 
  X, 
  Save, 
  FileText, 
  Globe, 
  Target, 
  BarChart3, 
  Users, 
  User, 
  MapPin, 
  Link2, 
  MessageSquare, 
  Mail, 
  Phone, 
  Loader2,
  Smartphone
} from 'lucide-react';

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

type FormularioEditarCampanaForm = FormularioCrearCampana & {
  nombre: string;
};

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
  const valoresIniciales: FormularioEditarCampanaForm = {
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
  
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormularioEditarCampanaForm>({
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

  const onSubmit = async (datos: FormularioEditarCampanaForm) => {
    const resultado = await actualizarCampana(campana.id, datos);
    
    if (resultado.exito) {
      alert(`✅ ${resultado.mensaje}`);
      onCerrar();
    } else {
      alert(`❌ ${resultado.mensaje}`);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 flex-shrink-0 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
              >
                {modoLectura ? <Eye className="w-6 h-6 text-white" /> : <Edit3 className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  {modoLectura ? 'Ver Detalles de Campaña' : 'Editar Campaña'}
                </h2>
                <p className="text-gray-400 text-sm">
                  {modoLectura ? 'Visualiza los detalles de la campaña' : 'Modifica los datos de la campaña'}
                </p>
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
        </div>

        <form onSubmit={modoLectura ? (e) => { e.preventDefault(); } : handleSubmit(onSubmit)} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Sección 1: Identificación */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <FileText className="w-5 h-5" style={{ color: '#ef0000' }} />
              Identificación de la Campaña
            </h3>
            
            {/* Nombre de la campaña */}
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                Nombre de la Campaña *
              </label>
              <input
                {...register('nombre', {
                  minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
                  onChange: () => {
                    nombreEditadoManualmenteRef.current = true;
                  }
                })}
                type="text"
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium text-sm hover:border-gray-400"
                placeholder="Ej: PE-MOTOPER-FB-ADQ-001-AC-BonoBienvenida"
              />
              {errors.nombre && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.nombre.message}</p>
              )}
              {nombreSugerido && (
                <div className="flex items-center justify-between mt-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs">
                  <span className="text-gray-700 font-medium">Sugerido: {nombreSugerido}</span>
                  {!modoLectura && (
                    <button
                      type="button"
                      onClick={() => {
                        nombreEditadoManualmenteRef.current = false;
                        setValue('nombre', nombreSugerido);
                      }}
                      className="text-white px-3 py-1 rounded-lg font-bold text-xs transition-all hover:shadow-md"
                      style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                    >
                      Usar sugerido
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* País y Vertical */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4" style={{ color: '#ef0000' }} />
                  País *
                </label>
                <select
                  {...register('pais')}
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
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
                  <Target className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Vertical *
                </label>
                <select
                  {...register('vertical')}
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                >
                  {Object.entries(VERTICALES_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.vertical && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.vertical.message}</p>
                )}
              </div>
            </div>

            {/* Plataforma y Segmento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Plataforma *
                </label>
                <select
                  {...register('plataforma')}
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                >
                  {Object.entries(PLATAFORMAS_LABELS).map(([codigo, nombre]) => (
                    <option key={codigo} value={codigo}>{nombre}</option>
                  ))}
                </select>
                {errors.plataforma && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.plataforma.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Segmento *
                </label>
                <select
                  {...register('segmento')}
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                >
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
            </div>

            {/* ID Plataforma Externa y Nombre en Plataforma */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                  ID Plataforma Externa (Opcional)
                </label>
                <input
                  {...register('idPlataformaExterna')}
                  type="text"
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium text-sm hover:border-gray-400"
                  placeholder="Ej: 123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Nombre en Plataforma (Opcional)
                </label>
                <input
                  {...register('nombrePlataforma')}
                  type="text"
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white font-medium text-sm hover:border-gray-400"
                  placeholder="Ej: Rayo - Bono Bienvenida"
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Nombre que aparece en Facebook/TikTok/Google
                </p>
              </div>
            </div>
          </div>

          {/* Sección 2: Dueño */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: '#ef0000' }} />
              Dueño de la Campaña
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Dueño *
                </label>
                <select
                  {...register('nombreDueno')}
                  onChange={(e) => {
                    register('nombreDueno').onChange(e);
                    manejarCambioDueno(e.target.value);
                  }}
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                >
                  {DUENOS.map((dueno) => (
                    <option key={dueno.nombre} value={dueno.nombre}>{dueno.nombre}</option>
                  ))}
                </select>
                {errors.nombreDueno && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.nombreDueno.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Iniciales *
                </label>
                <input
                  {...register('inicialesDueno')}
                  type="text"
                  maxLength={3}
                  disabled={modoLectura || !inicialesCustomManual}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                  placeholder="Ej: ABC"
                />
                {errors.inicialesDueno && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.inicialesDueno.message}</p>
                )}
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
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                placeholder="Ej: BonoBienvenida"
              />
              {errors.descripcionCorta && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.descripcionCorta.message}</p>
              )}
              <p className="text-xs text-gray-600 mt-2 font-medium">
                Sin espacios ni caracteres especiales (máximo 20 caracteres)
              </p>
            </div>
          </div>

          {/* Sección 3: Información de la Campaña */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
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
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                placeholder="Describe el objetivo principal de esta campaña..."
              />
              {errors.objetivo && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.objetivo.message}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                Beneficio/Programa *
              </label>
              <input
                {...register('beneficio')}
                type="text"
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
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
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                placeholder="Describe detalladamente la campaña, incluyendo estrategia, público objetivo, etc..."
              />
              {errors.descripcion && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.descripcion.message}</p>
              )}
            </div>
          </div>

          {/* Sección 4: Aterrizaje de la Campaña */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: '#ef0000' }} />
              Aterrizaje de la Campaña
            </h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" style={{ color: '#ef0000' }} />
                Tipo de Aterrizaje *
              </label>
              <select
                {...register('tipoAterrizaje')}
                disabled={modoLectura}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
              >
                {Object.entries(TIPOS_ATERRIZAJE_LABELS).map(([codigo, nombre]) => (
                  <option key={codigo} value={codigo}>{nombre}</option>
                ))}
              </select>
              {errors.tipoAterrizaje && (
                <p className="text-red-600 text-xs mt-1 font-medium">{errors.tipoAterrizaje.message}</p>
              )}
            </div>

            {/* URL de Aterrizaje (FORMS, URL, LANDING, APP) */}
            {(['FORMS', 'URL', 'LANDING', 'APP'].includes(tipoAterrizaje)) && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Link2 className="w-4 h-4" style={{ color: '#ef0000' }} />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                  placeholder="https://ejemplo.com/landing"
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Ingresa la URL completa del formulario, landing page o app
                </p>
                {errors.urlAterrizaje && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.urlAterrizaje.message}</p>
                )}
                
                {tipoAterrizaje === 'FORMS' && (
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Detalles de Campos del Formulario (Opcional)
                    </label>
                    <textarea
                      {...register('detalleAterrizaje')}
                      rows={3}
                      disabled={modoLectura}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                      placeholder="Ej: Nombre, Email, Teléfono, Mensaje..."
                    />
                    <p className="text-xs text-gray-600 mt-2 font-medium">
                      Describe qué campos tendrá el formulario de la landing de aterrizaje
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* WhatsApp */}
            {tipoAterrizaje === 'WHATSAPP' && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" style={{ color: '#ef0000' }} />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                  placeholder="+51987654321"
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Ingresa el número de WhatsApp con código de país (ej: +51987654321)
                </p>
                {errors.urlAterrizaje && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.urlAterrizaje.message}</p>
                )}
              </div>
            )}

            {/* Email */}
            {tipoAterrizaje === 'EMAIL' && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" style={{ color: '#ef0000' }} />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                  placeholder="contacto@ejemplo.com"
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Ingresa el correo electrónico de contacto
                </p>
                {errors.urlAterrizaje && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.urlAterrizaje.message}</p>
                )}
              </div>
            )}

            {/* Call Center */}
            {tipoAterrizaje === 'CALL_CENTER' && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" style={{ color: '#ef0000' }} />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                  placeholder="+51987654321"
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Ingresa el número de teléfono del call center con código de país
                </p>
                {errors.urlAterrizaje && (
                  <p className="text-red-600 text-xs mt-1 font-medium">{errors.urlAterrizaje.message}</p>
                )}
              </div>
            )}

            {/* Otro */}
            {tipoAterrizaje === 'OTRO' && (
              <div className="mt-4">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Detalles del Aterrizaje (Opcional)
                </label>
                <textarea
                  {...register('detalleAterrizaje')}
                  rows={3}
                  disabled={modoLectura}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-400 font-medium text-sm"
                  placeholder="Describe cómo funciona el aterrizaje de esta campaña..."
                />
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Proporciona detalles sobre cómo funciona el método de aterrizaje
                </p>
              </div>
            )
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onCerrar}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 shadow hover:shadow-md flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              {modoLectura ? 'Cerrar' : 'Cancelar'}
            </button>
            {!modoLectura && (
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
                    Guardar Cambios
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
