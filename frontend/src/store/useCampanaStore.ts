import { create } from 'zustand';
import { Campana, MetricasTrafficker, MetricasDueno, FormularioCrearCampana, HistoricoSemanal, Vertical, Segmento } from '../types';
import { campanaService, CampanaApi } from '../services/campanaService';
import { historicoService, HistoricoImportPayload } from '../services/historicoService';

// Función auxiliar para obtener el token de autenticación
function getAuthToken(): string | null {
  let token: string | null = null;
  
  // 1. Intentar obtener desde 'siscoca_user' (formato principal)
  const userStr = localStorage.getItem('siscoca_user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      token = user?.token || null;
      
      // Verificar que el token no esté vacío
      if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
        token = null;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }
  
  // 2. Si no hay token, intentar obtenerlo directamente del localStorage
  if (!token) {
    token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
    
    // Verificar que el token no sea inválido
    if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
      token = null;
    }
  }
  
  return token;
}

// Función para convertir CampanaApi a Campana
const SEGMENTOS_MAP: Record<string, Segmento> = {
  'ADQ': 'Adquisición',
  'ADQUISICION': 'Adquisición',
  'ADQUISICIÓN': 'Adquisición',
  'RET': 'Retención',
  'RETENCION': 'Retención',
  'RETENCIÓN': 'Retención',
  'RETO': 'Retorno',
  'RETORNO': 'Retorno',
  'MAS_VISTAS': 'Más Vistas',
  'MAS VISTAS': 'Más Vistas',
  'MÁS VISTAS': 'Más Vistas',
  'MAS_SEGUIDORES': 'Más Seguidores',
  'MAS SEGUIDORES': 'Más Seguidores',
  'MÁS SEGUIDORES': 'Más Seguidores',
  'MAS_VISTAS_PERFIL': 'Más Vistas del Perfil',
  'MAS VISTAS DEL PERFIL': 'Más Vistas del Perfil',
  'MÁS VISTAS DEL PERFIL': 'Más Vistas del Perfil'
};

const TIPOS_ATERRIZAJE_MAP: Record<string, Campana['tipoAterrizaje']> = {
  'FORMULARIO': 'FORMS',
  'FORMULARIO DE REGISTRO': 'FORMS',
  'FORMULARIO_REGISTRO': 'FORMS',
  'FORM': 'FORMS',
  'FORMS': 'FORMS',
  'WHATSAPP': 'WHATSAPP',
  'URL': 'URL',
  'LANDING': 'LANDING',
  'APP': 'APP',
  'CALL_CENTER': 'CALL_CENTER',
  'CALL CENTER': 'CALL_CENTER',
  'EMAIL': 'EMAIL',
  'CORREO': 'EMAIL',
  'OTRO': 'OTRO'
};

function normalizarSegmento(valor: string | null | undefined): Segmento {
  if (!valor) {
    return 'Adquisición';
  }
  const clave = valor.toString().trim().toUpperCase();
  return SEGMENTOS_MAP[clave] ?? (valor as Segmento) ?? 'Adquisición';
}

function normalizarTipoAterrizaje(valor: string | null | undefined): Campana['tipoAterrizaje'] {
  if (!valor) {
    return 'FORMS';
  }
  const clave = valor.toString().trim().toUpperCase();
  return TIPOS_ATERRIZAJE_MAP[clave] ?? (valor.toUpperCase() as Campana['tipoAterrizaje']) ?? 'FORMS';
}

function convertirApiACampana(api: CampanaApi): Campana {
  return {
    id: api.id.toString(),
    nombre: api.nombre,
    pais: api.pais as 'PE' | 'CO',
    vertical: api.vertical as Vertical,
    plataforma: api.plataforma as 'FB' | 'TT' | 'IG' | 'GG' | 'LI',
    segmento: normalizarSegmento(api.segmento),
    idPlataformaExterna: api.idPlataformaExterna,
    nombreDueno: api.nombreDueno,
    inicialesDueno: api.inicialesDueno,
    descripcionCorta: api.descripcionCorta,
    objetivo: api.objetivo,
    beneficio: api.beneficio,
    descripcion: api.descripcion,
    tipoAterrizaje: normalizarTipoAterrizaje(api.tipoAterrizaje),
    urlAterrizaje: api.urlAterrizaje,
    nombrePlataforma: api.nombrePlataforma,
    estado: api.estado as 'Pendiente' | 'Creativo Enviado' | 'Activa' | 'Archivada',
    archivoCreativo: api.archivoCreativo,
    nombreArchivoCreativo: api.nombreArchivoCreativo,
    urlCreativoExterno: api.urlCreativoExterno,
    urlInforme: api.urlInforme,
    alcance: api.alcance,
    clics: api.clics,
    leads: api.leads,
    costoSemanal: api.costoSemanal,
    costoLead: api.costoLead,
    conductoresRegistrados: api.conductoresRegistrados,
    conductoresPrimerViaje: api.conductoresPrimerViaje,
    costoConductorRegistrado: api.costoConductorRegistrado,
    costoConductorPrimerViaje: api.costoConductorPrimerViaje,
    costoConductor: api.costoConductor,
    fechaCreacion: new Date(api.fechaCreacion),
    ultimaActualizacion: new Date(api.fechaActualizacion),
    semanaISO: api.semanaISO
  };
}

function normalizarCampana(campana: Campana): Campana {
  return {
    ...campana,
    segmento: normalizarSegmento(campana.segmento),
    tipoAterrizaje: normalizarTipoAterrizaje(campana.tipoAterrizaje),
    pais: campana.pais as 'PE' | 'CO',
    vertical: campana.vertical as Vertical,
    plataforma: campana.plataforma as 'FB' | 'TT' | 'IG' | 'GG' | 'LI'
  };
}

// Función para convertir FormularioCrearCampana a CampanaApi
type FormularioCampanaConNombre = FormularioCrearCampana & {
  nombre?: string;
  estado?: Campana['estado'];
};

function mapearCampanaAFormulario(campana: Campana): FormularioCampanaConNombre {
  return {
    nombre: campana.nombre,
    pais: campana.pais,
    vertical: campana.vertical,
    plataforma: campana.plataforma,
    segmento: campana.segmento,
    idPlataformaExterna: campana.idPlataformaExterna,
    nombreDueno: campana.nombreDueno,
    inicialesDueno: campana.inicialesDueno,
    descripcionCorta: campana.descripcionCorta,
    objetivo: campana.objetivo,
    beneficio: campana.beneficio,
    descripcion: campana.descripcion,
    tipoAterrizaje: campana.tipoAterrizaje,
    urlAterrizaje: campana.urlAterrizaje,
    detalleAterrizaje: campana.detalleAterrizaje,
    nombrePlataforma: campana.nombrePlataforma,
    estado: campana.estado
  };
}

function convertirFormularioAApi(
  formulario: FormularioCampanaConNombre,
  nombreGenerado?: string,
  estadoActual?: Campana['estado']
): Omit<CampanaApi, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'semanaISO'> {
  const nombreManual = formulario.nombre?.trim();
  // Priorizar el nombre escrito manualmente; si no existe, usar el nombre generado recibido
  let nombre = nombreManual || nombreGenerado || '';
  
  if (!nombre && formulario.pais && formulario.vertical && formulario.plataforma && formulario.segmento && formulario.inicialesDueno && formulario.descripcionCorta) {
    const SEGMENTOS_ABREV: Record<string, string> = {
      'Adquisición': 'ADQ',
      'Retención': 'RET',
      'Retorno': 'RTO'
    };
    const segmentoAbrev = SEGMENTOS_ABREV[formulario.segmento] || 'XXX';
    // Nota: El ID se generará en el backend, aquí solo usamos un placeholder
    nombre = `${formulario.pais}-${formulario.vertical}-${formulario.plataforma}-${segmentoAbrev}-XXX-${formulario.inicialesDueno.toUpperCase()}-${formulario.descripcionCorta}`;
  }
  
  return {
    nombre: nombre || formulario.nombre || '',
    pais: formulario.pais,
    vertical: formulario.vertical,
    plataforma: formulario.plataforma,
    segmento: formulario.segmento,
    idPlataformaExterna: formulario.idPlataformaExterna,
    nombreDueno: formulario.nombreDueno,
    inicialesDueno: formulario.inicialesDueno,
    descripcionCorta: formulario.descripcionCorta,
    objetivo: formulario.objetivo,
    beneficio: formulario.beneficio,
    descripcion: formulario.descripcion,
    tipoAterrizaje: formulario.tipoAterrizaje,
    urlAterrizaje: formulario.urlAterrizaje,
    nombrePlataforma: formulario.nombrePlataforma,
    estado: formulario.estado ?? estadoActual ?? 'Pendiente'
  };
}

export interface HistoricoSemanalCampana {
  id: string;
  idCampana: string;
  semanaISO: number;
  fechaSemana: Date;
  // Métricas trafficker
  urlInforme?: string;
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number; // en USD
  costoLead?: number; // en USD
  // Métricas dueño
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  costoConductorRegistrado?: number; // en USD
  costoConductorPrimerViaje?: number; // en USD
  // Metadatos
  fechaRegistro: Date;
  registradoPor: string;
}

interface CampanaStore {
  campanas: Campana[];
  historico: HistoricoSemanal[];
  historicoSemanasCampanas: HistoricoSemanalCampana[];
  campanaSeleccionada: Campana | null;
  
  crearCampana: (datos: FormularioCrearCampana, idPersonalizado?: string) => Promise<{ exito: boolean; mensaje: string }>;
  actualizarCampana: (idCampana: string, datos: Partial<FormularioCampanaConNombre>) => Promise<{ exito: boolean; mensaje: string }>;
  subirMetricasTrafficker: (datos: MetricasTrafficker) => Promise<{ exito: boolean; mensaje: string }>;
  completarMetricasDueno: (datos: MetricasDueno) => Promise<{ exito: boolean; mensaje: string }>;
  cambiarEstadoCampana: (idCampana: string, nuevoEstado: Campana['estado']) => Promise<{ exito: boolean; mensaje: string }>;
  subirCreativo: (campana: Campana, archivo: File) => Promise<{ exito: boolean; mensaje: string }>;
  subirCreativoUrl: (campana: Campana, url: string) => Promise<{ exito: boolean; mensaje: string }>;
  descargarCreativo: (campana: Campana) => { exito: boolean; mensaje: string };
  archivarCampana: (campana: Campana) => Promise<{ exito: boolean; mensaje: string }>;
  reactivarCampana: (campana: Campana) => Promise<{ exito: boolean; mensaje: string }>;
  importarHistorico: (datosHistorico: any[]) => Promise<{ exito: boolean; mensaje: string; errores?: string[] }>;
  guardarHistoricoSemanal: (datos: Omit<HistoricoSemanalCampana, 'id' | 'fechaRegistro' | 'registradoPor'>) => Promise<{ exito: boolean; mensaje: string }>;
  obtenerHistoricoSemanalCampana: (idCampana: string) => HistoricoSemanalCampana[];
  eliminarHistoricoSemanal: (id: string) => Promise<{ exito: boolean; mensaje: string }>;
  obtenerCampanas: () => Promise<void>;
  obtenerHistorico: () => Promise<void>;
  seleccionarCampana: (campana: Campana | null) => void;
  eliminarCampana: (idCampana: string) => Promise<{ exito: boolean; mensaje: string }>;
}

export const useCampanaStore = create<CampanaStore>((set, get) => ({
  campanas: [],
  historico: [],
  historicoSemanasCampanas: [],
  campanaSeleccionada: null,

  crearCampana: async (datos: FormularioCrearCampana, nombreGenerado?: string) => {
    try {
      const datosApi = convertirFormularioAApi(datos, nombreGenerado);
      const campanaApi = await campanaService.crearCampana(datosApi);
      const nuevaCampana = convertirApiACampana(campanaApi);
      
      const campanas = get().campanas;
      set({ campanas: [...campanas, nuevaCampana] });
      
      return { exito: true, mensaje: `Campaña ${nuevaCampana.nombre} creada exitosamente` };
    } catch (error) {
      console.error('Error creando campaña:', error);
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  actualizarCampana: async (idCampana: string, datos: Partial<FormularioCampanaConNombre>) => {
    try {
      const campanas = get().campanas;
      const campanaOriginal = campanas.find(c => c.id === idCampana);
      if (!campanaOriginal) {
        return { exito: false, mensaje: 'Campaña no encontrada en memoria' };
      }

      const formularioBase = mapearCampanaAFormulario(campanaOriginal);
      const datosFormulario: FormularioCampanaConNombre = {
        ...formularioBase,
        ...datos,
        nombre: (datos.nombre ?? formularioBase.nombre) || campanaOriginal.nombre,
        estado: datos.estado ?? formularioBase.estado
      };

      const datosApi = convertirFormularioAApi(datosFormulario, undefined, campanaOriginal.estado);
      const campanaApi = await campanaService.actualizarCampana(parseInt(idCampana), datosApi);
      const campanaActualizada = convertirApiACampana(campanaApi);
      
      const campanasActualizadas = campanas.map(c => 
        c.id === idCampana ? campanaActualizada : c
      );
      
      set({ campanas: campanasActualizadas });
      
      return { exito: true, mensaje: `Campaña ${campanaActualizada.nombre} actualizada exitosamente` };
    } catch (error) {
      console.error('Error actualizando campaña:', error);
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  subirMetricasTrafficker: async (datos: MetricasTrafficker) => {
    try {
      // Calcular costo por lead automáticamente si no se proporciona
      let costoLeadCalculado = datos.costoLead;
      if (datos.costoSemanal && datos.leads && datos.leads > 0) {
        if (!costoLeadCalculado) {
          costoLeadCalculado = datos.costoSemanal / datos.leads;
          // Redondear a 2 decimales
          costoLeadCalculado = Math.round(costoLeadCalculado * 100) / 100;
        }
      } else if (datos.costoSemanal === 0 || datos.leads === 0) {
        costoLeadCalculado = 0;
      }
      
      const campanaApi = await campanaService.actualizarMetricasTrafficker({
        idCampana: parseInt(datos.idCampana),
        urlInforme: datos.urlInforme,
        alcance: datos.alcance,
        clics: datos.clics,
        leads: datos.leads,
        costoSemanal: datos.costoSemanal,
        costoLead: costoLeadCalculado || datos.costoLead
      });
      
      const campanaActualizada = convertirApiACampana(campanaApi);
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => 
        c.id === datos.idCampana ? campanaActualizada : c
      );
      
      set({ campanas: campanasActualizadas });
      
      return { exito: true, mensaje: 'Métricas del trafficker actualizadas exitosamente' };
    } catch (error) {
      console.error('Error actualizando métricas del trafficker:', error);
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  completarMetricasDueno: async (datos: MetricasDueno) => {
    try {
      // Primero verificar que existe la campaña en el store
      const campana = get().campanas.find(c => c.id === datos.idCampana);
      if (!campana) {
        throw new Error('Campaña no encontrada');
      }
      
      if (!campana.costoSemanal || campana.costoSemanal <= 0) {
        throw new Error('Debe subir primero las métricas del trafficker');
      }
      
      // Llamar al servicio del backend para guardar las métricas
      const campanaApiActualizada = await campanaService.actualizarMetricasDueno({
        idCampana: parseInt(datos.idCampana),
        conductoresRegistrados: datos.conductoresRegistrados,
        conductoresPrimerViaje: datos.conductoresPrimerViaje
      });
      
      // Convertir respuesta del backend a formato del store
      const campanaActualizada = convertirApiACampana(campanaApiActualizada);
      
      // Actualizar el store local con los datos del backend
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => 
        c.id === datos.idCampana ? campanaActualizada : c
      );
      
      set({ campanas: campanasActualizadas });
      localStorage.setItem('campanas', JSON.stringify(campanasActualizadas));
      
      return { exito: true, mensaje: `Métricas del dueño actualizadas exitosamente` };
    } catch (error) {
      console.error('Error actualizando métricas del dueño:', error);
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  cambiarEstadoCampana: async (idCampana: string, nuevoEstado: Campana['estado']) => {
    try {
      const campanaApi = await campanaService.cambiarEstadoCampana(parseInt(idCampana), nuevoEstado);
      const campanaActualizada = convertirApiACampana(campanaApi);
      
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => 
        c.id === idCampana ? campanaActualizada : c
      );
      
      set({ campanas: campanasActualizadas });
      
      return { exito: true, mensaje: `Estado de ${idCampana} cambiado a ${nuevoEstado}` };
    } catch (error) {
      console.error('Error cambiando estado de campaña:', error);
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  subirCreativoUrl: async (campana: Campana, url: string) => {
    try {
      // Validar URL
      if (!url || !url.trim()) {
        return { exito: false, mensaje: 'La URL no puede estar vacía' };
      }

      // Validar formato de URL básico
      try {
        new URL(url);
      } catch {
        return { exito: false, mensaje: 'La URL proporcionada no es válida' };
      }

      // Actualizar en el backend
      const campanaActualizadaApi = await campanaService.actualizarCampana(
        parseInt(campana.id),
        {
          urlCreativoExterno: url.trim(),
          archivoCreativo: undefined, // Limpiar archivo si existe
          nombreArchivoCreativo: undefined, // Limpiar nombre de archivo
          estado: 'Creativo Enviado'
        }
      );
      
      // Convertir respuesta del backend a formato del store
      const campanaActualizada = convertirApiACampana(campanaActualizadaApi);
      
      // Actualizar en el store local
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => 
        c.id === campana.id ? campanaActualizada : c
      );
      
      set({ campanas: campanasActualizadas });
      
      // También actualizar localStorage
      localStorage.setItem('campanas', JSON.stringify(campanasActualizadas));
      
      return { exito: true, mensaje: `URL externa guardada exitosamente para ${campana.nombre}` };
    } catch (error) {
      console.error('Error guardando URL externa:', error);
      
      let mensajeError = 'Error guardando URL externa';
      if (error instanceof Error) {
        mensajeError = error.message;
        
        if (error.message.includes('Sesión expirada') || error.message.includes('sin permisos') || error.message.includes('403')) {
          mensajeError = 'Sesión expirada. Por favor, recarga la página e inicia sesión nuevamente.';
        }
      } else if (typeof error === 'string') {
        mensajeError = error;
      }
      
      return { exito: false, mensaje: mensajeError };
    }
  },

  subirCreativo: async (campana: Campana, archivo: File) => {
    try {
      // Convertir archivo a base64 para almacenamiento
      const reader = new FileReader();
      const promesa = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(archivo);
      const archivoBase64 = await promesa;
      
      // Actualizar en el backend primero para persistir los cambios
      // El backend ahora acepta tanto "Creativo Enviado" (display name) como "CREATIVO_ENVIADO" (enum)
      const campanaActualizadaApi = await campanaService.actualizarCampana(
        parseInt(campana.id),
        {
          archivoCreativo: archivoBase64,
          nombreArchivoCreativo: archivo.name,
          urlCreativoExterno: undefined, // Limpiar URL externa si existe
          estado: 'Creativo Enviado' // Estado en display name (el backend lo convertirá correctamente)
        }
      );
      
      // Convertir respuesta del backend a formato del store
      const campanaActualizada = convertirApiACampana(campanaActualizadaApi);
      
      // Actualizar en el store local
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => 
        c.id === campana.id ? campanaActualizada : c
      );
      
      set({ campanas: campanasActualizadas });
      
      // También actualizar localStorage
      localStorage.setItem('campanas', JSON.stringify(campanasActualizadas));
      
      return { exito: true, mensaje: `Creativo subido exitosamente para ${campana.nombre}` };
    } catch (error) {
      console.error('Error subiendo creativo:', error);
      
      // Proporcionar mensaje de error más específico
      let mensajeError = 'Error subiendo creativo';
      if (error instanceof Error) {
        mensajeError = error.message;
        
        // Si es error de autenticación, sugerir relogin
        if (error.message.includes('Sesión expirada') || error.message.includes('sin permisos') || error.message.includes('403')) {
          mensajeError = 'Sesión expirada. Por favor, recarga la página e inicia sesión nuevamente.';
        }
      } else if (typeof error === 'string') {
        mensajeError = error;
      }
      
      return { exito: false, mensaje: mensajeError };
    }
  },

  descargarCreativo: (campana: Campana) => {
    if (!campana.archivoCreativo || !campana.nombreArchivoCreativo) {
      return { exito: false, mensaje: 'No hay creativo disponible para descargar' };
    }
    
    try {
      const link = document.createElement('a');
      link.href = campana.archivoCreativo;
      link.download = campana.nombreArchivoCreativo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return { exito: true, mensaje: 'Descarga iniciada' };
    } catch (error) {
      return { exito: false, mensaje: `Error descargando archivo: ${error}` };
    }
  },

  archivarCampana: async (campana: Campana) => {
    try {
      // Llamar al servicio del backend para archivar la campaña
      const campanaArchivadaApi = await campanaService.archivarCampana(parseInt(campana.id));
      
      // Convertir respuesta del backend a formato del store
      const campanaArchivada = convertirApiACampana(campanaArchivadaApi);
      
      // Actualizar la campaña en el store local
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => 
        c.id === campana.id ? campanaArchivada : c
      );
      
      set({ campanas: campanasActualizadas });
      localStorage.setItem('campanas', JSON.stringify(campanasActualizadas));

      // Recargar el histórico desde el backend para incluir la campaña archivada
      await get().obtenerHistorico();

      const semanaISO = campanaArchivada.semanaISO || obtenerSemanaISO(new Date());
      
      return { 
        exito: true, 
        mensaje: `Campaña ${campanaArchivada.nombre} archivada exitosamente en la semana ${semanaISO}` 
      };
    } catch (error) {
      console.error('Error archivando campaña:', error);
      const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
      return { exito: false, mensaje: mensajeError };
    }
  },

  reactivarCampana: async (campana: Campana) => {
    try {
      // Llamar al servicio del backend para reactivar la campaña
      const campanaReactivadaApi = await campanaService.reactivarCampana(parseInt(campana.id));
      
      // Convertir respuesta del backend a formato del store
      const campanaReactivada = convertirApiACampana(campanaReactivadaApi);
      
      // Actualizar la campaña en el store local
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => 
        c.id === campana.id ? campanaReactivada : c
      );
      
      set({ campanas: campanasActualizadas });
      localStorage.setItem('campanas', JSON.stringify(campanasActualizadas));

      // Recargar el histórico desde el backend
      await get().obtenerHistorico();
      
      return { 
        exito: true, 
        mensaje: `Campaña ${campanaReactivada.nombre} reactivada exitosamente` 
      };
    } catch (error) {
      console.error('Error reactivando campaña:', error);
      const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
      return { exito: false, mensaje: mensajeError };
    }
  },

  importarHistorico: async (datosHistorico: any[]) => {
    const parseNumber = (valor: any): number | undefined => {
      if (valor === null || valor === undefined || valor === '') {
        return undefined;
      }
      if (typeof valor === 'number') {
        return isNaN(valor) ? undefined : valor;
      }
      const convertido = parseFloat(String(valor).replace(/[$,]/g, ''));
      return isNaN(convertido) ? undefined : convertido;
    };

    const parseInteger = (valor: any): number | undefined => {
      const numero = parseNumber(valor);
      return numero !== undefined ? Math.round(numero) : undefined;
    };

    try {
      const payload: HistoricoImportPayload[] = datosHistorico.map((registro: any) => {
        const semanaISO = parseInteger(registro.SEMANA_ISO);
        const campanaId = parseInteger(registro.ID_CAMPANIA);

        return {
          campanaId: campanaId,
          campanaIdPlataforma: registro.ID_CAMPANIA ? String(registro.ID_CAMPANIA).trim() : undefined,
          campanaNombre: registro.NOMBRE_CAMPANIA,
          semanaISO,
          fechaArchivo: registro.FECHA_ARCHIVO,
          alcance: parseInteger(registro.ALCANCE),
          clics: parseInteger(registro.CLICS),
          leads: parseNumber(registro.LEADS),
          costoSemanal: parseNumber(registro.COSTO_SEMANAL),
          costoLead: parseNumber(registro.COSTO_LEAD),
          conductoresRegistrados: parseInteger(registro.CONDUCTORES_REGISTRADOS),
          conductoresPrimerViaje: parseInteger(registro.CONDUCTORES_PRIMER_VIAJE),
          costoConductorRegistrado: parseNumber(registro.COSTO_CONDUCTOR_REGISTRADO),
          costoConductorPrimerViaje: parseNumber(registro.COSTO_CONDUCTOR_PRIMER_VIAJE),
          estadoActividad: registro.ESTADO_ACTIVIDAD,
          estadoMetricas: registro.ESTADO_METRICAS,
          mensaje: registro.MENSAJE,
          objetivo: registro.OBJETIVO,
          beneficio: registro.BENEFICIO_PROGRAMA,
          descripcion: registro.DESCRIPCION,
          registradoPor: registro.REGISTRADO_POR,
          urlInforme: registro.URL_INFORME,
          pais: registro.PAIS,
          vertical: registro.VERTICAL,
          plataforma: registro.PLATAFORMA,
          segmento: registro.SEGMENTO,
        };
      });

      const respuesta = await historicoService.importarHistorico(payload);

      await get().obtenerHistorico();

      const mensaje = `Importación completada: ${respuesta.registrosProcesados} registros procesados. ` +
        `${respuesta.registrosCreados} creados, ${respuesta.registrosActualizados} actualizados.`;

      return {
        exito: true,
        mensaje,
        errores: respuesta.errores,
      };
    } catch (error) {
      const mensajeError = error instanceof Error ? error.message : String(error);
      return { exito: false, mensaje: `Error importando histórico: ${mensajeError}` };
    }
  },

  obtenerCampanas: async () => {
    try {
      const campanasApi = await campanaService.obtenerCampanas();
      const campanas = campanasApi.map(convertirApiACampana);
      set({ campanas });
    } catch (error) {
      console.error('Error obteniendo campañas:', error);
      // Fallback a localStorage si hay error
      try {
        const campanasGuardadas = localStorage.getItem('campanas');
        if (campanasGuardadas) {
        const campanas = JSON.parse(campanasGuardadas).map((c: Campana) => {
          const campanaNormalizada = normalizarCampana({
            ...c,
            fechaCreacion: new Date(c.fechaCreacion),
            ultimaActualizacion: new Date(c.ultimaActualizacion)
          });
          return campanaNormalizada;
        });
        set({ campanas });
        }
      } catch (localStorageError) {
        console.error('Error cargando datos de localStorage:', localStorageError);
        // Si no hay datos, inicializar con array vacío
        set({ campanas: [] });
      }
    }
  },

  obtenerHistorico: async () => {
    try {
      // Intentar obtener desde el backend primero
      try {
        const { API_BASE_URL } = await import('../config/api');
        const token = getAuthToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}/historico`, {
          method: 'GET',
          headers
        });
        
        if (response.ok) {
          const historicoBackend = await response.json();
          console.log('Histórico recibido del backend:', historicoBackend);
          
          // Convertir el formato del backend al formato del frontend
          const historico = historicoBackend.map((h: any) => {
            // Extraer datos de la campaña o del histórico mismo
            const campanaId = h.campana?.id || h.id || '0';
            const campanaNombre = h.campana?.nombre || 'Campaña sin nombre';
            const campanaPais = h.campana?.pais || 'PE';
            const campanaVertical = h.campana?.vertical || 'MOTOPER';
            const campanaPlataforma = h.campana?.plataforma || 'FB';
            const campanaSegmento = h.campana?.segmento || 'Adquisición';
            const campanaObjetivo = h.campana?.objetivo || '';
            const campanaBeneficio = h.campana?.beneficio || '';
            const campanaDescripcion = h.campana?.descripcion || '';
            const campanaNombreDueno = h.campana?.nombreDueno || '';
            
            return {
              id: `${campanaId}-${h.semanaISO}`,
              idCampana: campanaId.toString(),
              nombre: campanaNombre,
              semanaISO: h.semanaISO || 0,
              fechaArchivo: h.fechaSemana ? new Date(h.fechaSemana) : (h.fechaRegistro ? new Date(h.fechaRegistro) : new Date()),
              pais: campanaPais,
              vertical: campanaVertical,
              plataforma: campanaPlataforma,
              segmento: campanaSegmento,
              objetivo: campanaObjetivo,
              beneficio: campanaBeneficio,
              descripcion: campanaDescripcion,
              nombreDueno: campanaNombreDueno,
              alcance: h.alcance,
              clics: h.clics,
              leads: h.leads,
              costoSemanal: h.costoSemanal,
              costoLead: h.costoLead,
              conductoresRegistrados: h.conductoresRegistrados,
              conductoresPrimerViaje: h.conductoresPrimerViaje,
              costoConductorRegistrado: h.costoConductorRegistrado,
              costoConductorPrimerViaje: h.costoConductorPrimerViaje,
              estadoActividad: 'FINALIZADA',
              estadoMetricas: (h.alcance != null && h.clics != null && h.leads != null && h.costoSemanal != null && 
                              h.conductoresRegistrados != null && h.conductoresPrimerViaje != null) ? 'COMPLETA' : 'INCOMPLETA',
              mensaje: 'Archivada desde backend'
            };
          });
          
          console.log('Histórico convertido:', historico);
          set({ historico });
          localStorage.setItem('historico', JSON.stringify(historico));
          return;
        } else {
          console.error('Error obteniendo histórico del backend:', response.status, response.statusText);
        }
      } catch (backendError) {
        console.error('Error obteniendo histórico desde backend:', backendError);
        console.log('Usando localStorage como respaldo');
      }
      
      // Si falla, usar localStorage como respaldo
      const historicoGuardado = localStorage.getItem('historico');
      if (historicoGuardado) {
        const historico = JSON.parse(historicoGuardado);
        historico.forEach((h: HistoricoSemanal) => {
          h.fechaArchivo = new Date(h.fechaArchivo);
        });
        set({ historico });
      } else {
        set({ historico: [] });
      }
      
      // Cargar histórico semanal de campañas
      const historicoSemanasGuardado = localStorage.getItem('historicoSemanasCampanas');
      if (historicoSemanasGuardado) {
        const historicoSemanasCampanas = JSON.parse(historicoSemanasGuardado);
        historicoSemanasCampanas.forEach((h: HistoricoSemanalCampana) => {
          h.fechaSemana = new Date(h.fechaSemana);
          h.fechaRegistro = new Date(h.fechaRegistro);
        });
        set({ historicoSemanasCampanas });
      } else {
        set({ historicoSemanasCampanas: [] });
      }
    } catch (error) {
      console.error('Error cargando histórico:', error);
      set({ historico: [], historicoSemanasCampanas: [] });
    }
  },

  seleccionarCampana: (campana: Campana | null) => {
    set({ campanaSeleccionada: campana });
  },

  eliminarCampana: async (idCampana: string) => {
    try {
      // Llamar al servicio del backend para eliminar la campaña
      const eliminada = await campanaService.eliminarCampana(parseInt(idCampana));
      
      if (eliminada) {
        // Si se eliminó exitosamente en el backend, actualizar el estado local
        const campanas = get().campanas.filter(c => c.id !== idCampana);
        set({ campanas });
        localStorage.setItem('campanas', JSON.stringify(campanas));
        
        return { exito: true, mensaje: 'Campaña eliminada exitosamente' };
      } else {
        return { exito: false, mensaje: 'No se pudo eliminar la campaña' };
      }
    } catch (error) {
      console.error('Error eliminando campaña:', error);
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  guardarHistoricoSemanal: async (datos) => {
    try {
      const historicoSemanasCampanas = get().historicoSemanasCampanas;
      const ahora = new Date();
      
      // Generar ID único
      const id = `${datos.idCampana}-${datos.semanaISO}-${ahora.getTime()}`;
      
      // Verificar si ya existe un registro para esta campaña y semana
      const indiceExistente = historicoSemanasCampanas.findIndex(
        h => h.idCampana === datos.idCampana && h.semanaISO === datos.semanaISO
      );
      
      const nuevoRegistro: HistoricoSemanalCampana = {
        id,
        ...datos,
        fechaRegistro: ahora,
        registradoPor: 'Usuario' // En una app real, obtendrías esto del contexto de usuario
      };
      
      let historicoActualizado;
      if (indiceExistente >= 0) {
        // Actualizar registro existente haciendo merge (preservar campos existentes que no se envían)
        const registroExistente = historicoSemanasCampanas[indiceExistente];
        historicoActualizado = [...historicoSemanasCampanas];
        historicoActualizado[indiceExistente] = {
          ...registroExistente, // Preservar campos existentes
          ...datos, // Sobrescribir solo con los campos enviados
          id: registroExistente.id, // Mantener el ID original
          fechaRegistro: registroExistente.fechaRegistro, // Mantener fecha de registro original
          registradoPor: registroExistente.registradoPor || nuevoRegistro.registradoPor // Mantener registradoPor original si existe
        };
      } else {
        // Agregar nuevo registro
        historicoActualizado = [...historicoSemanasCampanas, nuevoRegistro];
      }
      
      set({ historicoSemanasCampanas: historicoActualizado });
      localStorage.setItem('historicoSemanasCampanas', JSON.stringify(historicoActualizado));
      
      return { 
        exito: true, 
        mensaje: `Métricas de la semana ${datos.semanaISO} guardadas exitosamente` 
      };
    } catch (error) {
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  obtenerHistoricoSemanalCampana: (idCampana: string) => {
    const historicoSemanasCampanas = get().historicoSemanasCampanas;
    return historicoSemanasCampanas.filter(h => h.idCampana === idCampana);
  },

  eliminarHistoricoSemanal: async (id: string) => {
    try {
      const historicoSemanasCampanas = get().historicoSemanasCampanas;
      const historicoActualizado = historicoSemanasCampanas.filter(h => h.id !== id);
      
      set({ historicoSemanasCampanas: historicoActualizado });
      localStorage.setItem('historicoSemanasCampanas', JSON.stringify(historicoActualizado));
      
      return { exito: true, mensaje: 'Registro histórico eliminado exitosamente' };
    } catch (error) {
      return { exito: false, mensaje: `Error: ${error}` };
    }
  }
}));

useCampanaStore.subscribe((state) => {
  localStorage.setItem('campanas', JSON.stringify(state.campanas));
});


function obtenerSemanaISO(fecha: Date): number {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 + week1.getDay() + 1) / 7);
}

