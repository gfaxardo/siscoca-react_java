export type EstadoCampana = 'Pendiente' | 'Creativo Enviado' | 'Activa' | 'Archivada';

export type EstadoActividad = 'ACTIVA' | 'FINALIZADA' | 'CANCELADA';

export type EstadoMetricas = 'COMPLETA' | 'INCOMPLETA' | 'NO_ACTUALIZADA' | 'ERROR';

export type Segmento = 'Adquisición' | 'Retención' | 'Retorno';

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
  estado: EstadoCampana;
  archivoCreativo?: string;
  nombreArchivoCreativo?: string;
  urlInforme?: string;
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number;
  costoLead?: number;
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  costoConductorRegistrado?: number;
  costoConductorPrimerViaje?: number;
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
  costoSemanal: number;
  costoLead?: number;
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
  costoSemanal?: number;
  costoLead?: number;
  
  // Métricas del dueño
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
  costoConductorRegistrado?: number;
  costoConductorPrimerViaje?: number;
  
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
}

