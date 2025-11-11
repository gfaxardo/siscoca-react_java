export type EstadoCampana = 'Pendiente' | 'Creativo Enviado' | 'Activa' | 'Archivada';

export type EstadoActividad = 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';

export type EstadoMetricas = 'COMPLETA' | 'INCOMPLETA' | 'NO_ACTUALIZADA' | 'ERROR';

export type Segmento = 'Adquisición' | 'Retención' | 'Retorno' | 'Más Vistas' | 'Más Seguidores' | 'Más Vistas del Perfil';

export type Pais = 'PE' | 'CO';

export type Vertical = 
  | 'MOTOPER' 
  | 'MOTODEL' 
  | 'CARGO' 
  | 'AUTOPER' 
  | 'B2B' 
  | 'PREMIER' 
  | 'CONFORT' 
  | 'YEGOPRO' 
  | 'YEGOMIAUTO' 
  | 'YEGOMIMOTO';

export type Plataforma = 'FB' | 'TT' | 'IG' | 'GG' | 'LI';

export type TipoAterrizaje = 'FORMS' | 'WHATSAPP' | 'URL' | 'LANDING' | 'APP' | 'CALL_CENTER' | 'EMAIL' | 'OTRO';

export const VERTICALES_LABELS: Record<Vertical, string> = {
  MOTOPER: 'Moto Persona',
  MOTODEL: 'Moto Delivery',
  CARGO: 'Cargo',
  AUTOPER: 'Auto Persona',
  B2B: 'B2B',
  PREMIER: 'Premier',
  CONFORT: 'Confort',
  YEGOPRO: 'YegoPro',
  YEGOMIAUTO: 'YegoMiAuto',
  YEGOMIMOTO: 'YegoMiMoto'
};

export const PLATAFORMAS_LABELS: Record<Plataforma, string> = {
  FB: 'Facebook Ads',
  TT: 'TikTok Ads',
  IG: 'Instagram Ads',
  GG: 'Google Ads',
  LI: 'LinkedIn Ads'
};

export const PAISES_LABELS: Record<Pais, string> = {
  PE: 'Perú',
  CO: 'Colombia'
};

export const TIPOS_ATERRIZAJE_LABELS: Record<TipoAterrizaje, string> = {
  FORMS: 'Formulario de Registro',
  WHATSAPP: 'WhatsApp Business',
  URL: 'URL Externa',
  LANDING: 'Landing Page',
  APP: 'Aplicación Móvil',
  CALL_CENTER: 'Call Center',
  EMAIL: 'Correo Electrónico',
  OTRO: 'Otro'
};

export interface Dueno {
  nombre: string;
  iniciales: string;
}

export const DUENOS: Dueno[] = [
  { nombre: 'Ariana de la Cruz', iniciales: 'AC' },
  { nombre: 'Diego Valdivia', iniciales: 'DV' },
  { nombre: 'Frank Huarilloclla', iniciales: 'FH' },
  { nombre: 'Gonzalo Fajardo', iniciales: 'GF' },
  { nombre: 'Martha Pineda', iniciales: 'MP' },
  { nombre: 'Paola Jorge', iniciales: 'PJ' },
  { nombre: 'Otro', iniciales: '' }
];

export interface Creativo {
  id: string;
  campanaId: string;
  archivoCreativo?: string; // Base64 del archivo
  nombreArchivoCreativo?: string;
  urlCreativoExterno?: string;
  activo: boolean;
  orden: number;
  fechaCreacion: Date;
  fechaActualizacion?: Date;
}

export interface Campana {
  id: string;
  nombre: string;
  pais: Pais;
  vertical: Vertical;
  plataforma: Plataforma;
  segmento: Segmento;
  idPlataformaExterna?: string;
  nombreDueno: string;
  inicialesDueno: string;
  descripcionCorta: string;
  objetivo: string;
  beneficio: string;
  descripcion: string;
  tipoAterrizaje: TipoAterrizaje;
  urlAterrizaje?: string;
  detalleAterrizaje?: string; // Detalles de campos del formulario cuando tipoAterrizaje es FORMS
  nombrePlataforma?: string;
  estado: EstadoCampana;
  // Campos legacy para compatibilidad (deprecated - usar creativos[])
  archivoCreativo?: string;
  nombreArchivoCreativo?: string;
  urlCreativoExterno?: string;
  // Array de creativos (nuevo sistema)
  creativos?: Creativo[];
  urlInforme?: string;
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number; // en USD
  costoLead?: number; // en USD
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  costoConductorRegistrado?: number; // en USD
  costoConductorPrimerViaje?: number; // en USD
  costoConductor?: number; // en USD - Costo por conductor (costoSemanal / conductoresRegistrados)
  fechaCreacion: Date;
  ultimaActualizacion: Date;
  semanaISO: number;
}

export interface MetricasTrafficker {
  idCampana: string;
  urlInforme?: string;
  alcance: number;
  clics: number;
  leads: number;
  costoSemanal: number; // en USD
  costoLead?: number; // en USD
}

export interface MetricasDueno {
  idCampana: string;
  conductoresRegistrados: number;
  conductoresPrimerViaje: number;
}

export interface HistoricoSemanal {
  id: string;
  idCampana: string;
  nombre: string;
  semanaISO: number;
  fechaArchivo: Date;
  pais: Pais;
  vertical: Vertical;
  plataforma: Plataforma;
  segmento: Segmento;
  objetivo: string;
  beneficio: string;
  descripcion: string;
  nombreDueno: string;
  
  // Métricas del trafficker
  urlInforme?: string;
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number; // en USD
  costoLead?: number; // en USD
  
  // Métricas del dueño
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  costoConductorRegistrado?: number; // en USD
  costoConductorPrimerViaje?: number; // en USD
  
  // Estados
  estadoActividad: string;
  estadoMetricas: string;
  mensaje: string;
}

export interface FormularioCrearCampana {
  pais: Pais;
  vertical: Vertical;
  plataforma: Plataforma;
  segmento: Segmento;
  idPlataformaExterna?: string;
  nombreDueno: string;
  inicialesDueno: string;
  descripcionCorta: string;
  objetivo: string;
  beneficio: string;
  descripcion: string;
  tipoAterrizaje: TipoAterrizaje;
  urlAterrizaje?: string;
  detalleAterrizaje?: string; // Detalles de campos del formulario cuando tipoAterrizaje es FORMS
  nombrePlataforma?: string;
}

// Nuevos tipos para métricas ideales y evaluación
export interface MetricaIdeal {
  id: string;
  nombre: string;
  valorIdeal: number;
  valorMinimo: number;
  valorMaximo: number;
  unidad: string;
  categoria: 'ALCANCE' | 'LEADS' | 'COSTO' | 'CONDUCTORES' | 'CONVERSION';
  vertical?: Vertical;
  pais?: Pais;
  plataforma?: Plataforma;
  segmento?: Segmento;
  activa: boolean;
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface EvaluacionMetrica {
  metrica: string;
  valorActual: number;
  valorIdeal: number;
  estado: 'EXCELENTE' | 'BUENO' | 'REGULAR' | 'MALO' | 'CRITICO';
  porcentajeDesviacion: number;
  recomendacion: string;
  color: string;
}

export interface HistorialCambio {
  id: string;
  idCampana: string;
  tipoCambio: 'CREACION' | 'EDICION' | 'METRICAS' | 'ESTADO' | 'ARCHIVADO';
  campoModificado: string;
  valorAnterior: any;
  valorNuevo: any;
  usuario: string;
  fechaCambio: Date;
  comentario?: string;
}

export interface MetricasGlobales {
  costoTotal: number;
  alcanceTotal: number;
  leadsTotales: number;
  conductoresTotales: number;
  costoPromedioLead: number;
  costoPromedioConductor: number;
  roi: number;
  evaluaciones: EvaluacionMetrica[];
}

// =====================================================
// TIPOS PARA SISTEMA DE TAREAS Y CHAT
// =====================================================

export type TipoTarea = 
  | 'Crear Campaña'
  | 'Enviar Creativo'
  | 'Activar Campaña'
  | 'Subir Métricas Trafficker'
  | 'Subir Métricas Dueño'
  | 'Archivar Campaña';

export type RolUsuario = 'Admin' | 'Trafficker' | 'Dueño' | 'Marketing';

export interface TareaPendiente {
  id: string;
  tipoTarea: TipoTarea;
  campanaId: string;
  campanaNombre: string;
  asignadoA: string;
  responsableRol: RolUsuario;
  descripcion: string;
  urgente: boolean;
  completada: boolean;
  fechaCreacion: Date;
  fechaCompletada?: Date;
}

export interface MensajeChat {
  id: string;
  campanaId: string;
  campanaNombre: string;
  remitente: string;
  mensaje: string;
  leido: boolean;
  urgente: boolean;
  fechaCreacion: Date;
}

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  iniciales: string;
  rol: RolUsuario;
}

