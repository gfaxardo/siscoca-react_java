import { create } from 'zustand';
import { Campana, MetricasTrafficker, MetricasDueno, FormularioCrearCampana, HistoricoSemanal, Vertical, Segmento } from '../types';

interface HistoricoSemanalCampana {
  id: string;
  idCampana: string;
  semanaISO: number;
  fechaSemana: Date;
  // Métricas trafficker
  alcance?: number;
  clics?: number;
  leads?: number;
  costoSemanal?: number;
  costoLead?: number;
  // Métricas dueño
  conductoresRegistrados?: number;
  conductoresPrimerViaje?: number;
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
  subirMetricasTrafficker: (datos: MetricasTrafficker) => Promise<{ exito: boolean; mensaje: string }>;
  completarMetricasDueno: (datos: MetricasDueno) => Promise<{ exito: boolean; mensaje: string }>;
  cambiarEstadoCampana: (idCampana: string, nuevoEstado: Campana['estado']) => Promise<{ exito: boolean; mensaje: string }>;
  subirCreativo: (campana: Campana, archivo: File) => Promise<{ exito: boolean; mensaje: string }>;
  descargarCreativo: (campana: Campana) => { exito: boolean; mensaje: string };
  archivarCampana: (campana: Campana) => Promise<{ exito: boolean; mensaje: string }>;
  importarHistorico: (datosHistorico: any[]) => Promise<{ exito: boolean; mensaje: string }>;
  guardarHistoricoSemanal: (datos: Omit<HistoricoSemanalCampana, 'id' | 'fechaRegistro' | 'registradoPor'>) => Promise<{ exito: boolean; mensaje: string }>;
  obtenerHistoricoSemanalCampana: (idCampana: string) => HistoricoSemanalCampana[];
  eliminarHistoricoSemanal: (id: string) => Promise<{ exito: boolean; mensaje: string }>;
  obtenerCampanas: () => void;
  obtenerHistorico: () => void;
  seleccionarCampana: (campana: Campana | null) => void;
  eliminarCampana: (idCampana: string) => void;
}

export const useCampanaStore = create<CampanaStore>((set, get) => ({
  campanas: [],
  historico: [],
  historicoSemanasCampanas: [],
  campanaSeleccionada: null,

  crearCampana: async (datos: FormularioCrearCampana, idPersonalizado?: string) => {
    try {
      const campanas = get().campanas;
      const proximoNumero = idPersonalizado || (campanas.length + 1).toString().padStart(3, '0');
      
      const SEGMENTOS_ABREV: Record<string, string> = {
        'Adquisición': 'ADQ',
        'Retención': 'RET',
        'Retorno': 'RTO'
      };
      
      const segmentoAbrev = SEGMENTOS_ABREV[datos.segmento] || 'XXX';
      
      const nombreGenerado = `${datos.pais}-${datos.vertical}-${datos.plataforma}-${segmentoAbrev}-${proximoNumero}-${datos.inicialesDueno.toUpperCase()}-${datos.descripcionCorta}`;
      
      const fechaActual = new Date();
      const semanaISO = obtenerSemanaISO(fechaActual);
      
      const nuevaCampana: Campana = {
        id: proximoNumero,
        nombre: nombreGenerado,
        pais: datos.pais,
        vertical: datos.vertical,
        plataforma: datos.plataforma,
        segmento: datos.segmento,
        idPlataformaExterna: datos.idPlataformaExterna,
        nombreDueno: datos.nombreDueno,
        inicialesDueno: datos.inicialesDueno.toUpperCase(),
        descripcionCorta: datos.descripcionCorta,
        objetivo: datos.objetivo,
        beneficio: datos.beneficio,
        descripcion: datos.descripcion,
        estado: 'Pendiente',
        fechaCreacion: fechaActual,
        ultimaActualizacion: fechaActual,
        semanaISO
      };
      
      set({ campanas: [...campanas, nuevaCampana] });
      
      return { exito: true, mensaje: `Campaña ${nombreGenerado} creada exitosamente` };
    } catch (error) {
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  subirMetricasTrafficker: async (datos: MetricasTrafficker) => {
    try {
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => {
        if (c.id === datos.idCampana) {
          if (c.estado !== 'Activa') {
            throw new Error('La campaña debe estar en estado "Activa" para subir métricas');
          }
          
          const costoLead = datos.costoLead || (datos.costoSemanal / datos.leads);
          
          return {
            ...c,
            urlInforme: datos.urlInforme,
            alcance: datos.alcance,
            clics: datos.clics,
            leads: datos.leads,
            costoSemanal: datos.costoSemanal,
            costoLead,
            ultimaActualizacion: new Date()
          };
        }
        return c;
      });
      
      set({ campanas: campanasActualizadas });
      return { exito: true, mensaje: `Métricas del trafficker actualizadas para ${datos.idCampana}` };
    } catch (error) {
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  completarMetricasDueno: async (datos: MetricasDueno) => {
    try {
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => {
        if (c.id === datos.idCampana) {
          if (!c.costoSemanal || c.costoSemanal <= 0) {
            throw new Error('Debe subir primero las métricas del trafficker');
          }
          
          const costoConductorRegistrado = datos.conductoresRegistrados > 0 
            ? c.costoSemanal / datos.conductoresRegistrados 
            : 0;
          const costoConductorPrimerViaje = datos.conductoresPrimerViaje > 0 
            ? c.costoSemanal / datos.conductoresPrimerViaje 
            : 0;
          
          return {
            ...c,
            conductoresRegistrados: datos.conductoresRegistrados,
            conductoresPrimerViaje: datos.conductoresPrimerViaje,
            costoConductorRegistrado,
            costoConductorPrimerViaje,
            ultimaActualizacion: new Date()
          };
        }
        return c;
      });
      
      set({ campanas: campanasActualizadas });
      return { exito: true, mensaje: `Métricas del dueño actualizadas para ${datos.idCampana}` };
    } catch (error) {
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  cambiarEstadoCampana: async (idCampana: string, nuevoEstado: Campana['estado']) => {
    try {
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => {
        if (c.id === idCampana) {
          return {
            ...c,
            estado: nuevoEstado,
            ultimaActualizacion: new Date()
          };
        }
        return c;
      });
      
      set({ campanas: campanasActualizadas });
      return { exito: true, mensaje: `Estado de ${idCampana} cambiado a ${nuevoEstado}` };
    } catch (error) {
      return { exito: false, mensaje: `Error: ${error}` };
    }
  },

  subirCreativo: async (campana: Campana, archivo: File) => {
    try {
      // Verificar espacio disponible en localStorage
      const verificarEspacioDisponible = () => {
        try {
          const testKey = 'test-space-check';
          const testData = 'x'.repeat(1024); // 1KB de prueba
          localStorage.setItem(testKey, testData);
          localStorage.removeItem(testKey);
          return true;
        } catch (error) {
          return false;
        }
      };

      // Si no hay espacio, limpiar datos antiguos
      if (!verificarEspacioDisponible()) {
        console.warn('⚠️ Espacio insuficiente en localStorage, limpiando datos antiguos...');
        
        // Mantener solo las últimas 10 campañas más recientes
        const campanas = get().campanas;
        const campanasOrdenadas = campanas.sort((a, b) => 
          new Date(b.ultimaActualizacion).getTime() - new Date(a.ultimaActualizacion).getTime()
        );
        const campanasParaMantener = campanasOrdenadas.slice(0, 10);
        
        set({ campanas: campanasParaMantener });
        localStorage.setItem('campanas', JSON.stringify(campanasParaMantener));
      }

      // Convertir archivo a base64 para almacenamiento simple
      const reader = new FileReader();
      const promesa = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      
      reader.readAsDataURL(archivo);
      const archivoBase64 = await promesa;
      
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => {
        if (c.id === campana.id) {
          return {
            ...c,
            archivoCreativo: archivoBase64,
            nombreArchivoCreativo: archivo.name,
            estado: 'Creativo Enviado' as Campana['estado'],
            ultimaActualizacion: new Date()
          };
        }
        return c;
      });
      
      set({ campanas: campanasActualizadas });
      return { exito: true, mensaje: `Creativo subido exitosamente para ${campana.nombre}` };
    } catch (error) {
      return { exito: false, mensaje: `Error subiendo creativo: ${error}` };
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
      // Validar que la campaña tenga métricas completas
      const metricasCompletas = verificarMetricasCompletas(campana);
      
      if (!metricasCompletas) {
        return { 
          exito: false, 
          mensaje: 'No se puede archivar: Faltan métricas del trafficker o dueño de campaña' 
        };
      }

      // Preparar datos para el histórico
      const ahora = new Date();
      const semanaISO = obtenerSemanaISO(ahora);
      
      const datosHistorico: HistoricoSemanal = {
        id: `${campana.id}-${semanaISO}`,
        idCampana: campana.id,
        nombre: campana.nombre,
        semanaISO,
        fechaArchivo: ahora,
        pais: campana.pais,
        vertical: campana.vertical,
        plataforma: campana.plataforma,
        segmento: campana.segmento,
        objetivo: campana.objetivo,
        beneficio: campana.beneficio,
        descripcion: campana.descripcion,
        nombreDueno: campana.nombreDueno,
        
        // Métricas del trafficker
        urlInforme: campana.urlInforme || undefined,
        alcance: campana.alcance || undefined,
        clics: campana.clics || undefined,
        leads: campana.leads || undefined,
        costoSemanal: campana.costoSemanal || undefined,
        costoLead: campana.costoLead || undefined,
        
        // Métricas del dueño
        conductoresRegistrados: campana.conductoresRegistrados || undefined,
        conductoresPrimerViaje: campana.conductoresPrimerViaje || undefined,
        costoConductorRegistrado: campana.costoConductorRegistrado || undefined,
        costoConductorPrimerViaje: campana.costoConductorPrimerViaje || undefined,
        
        // Estados
        estadoActividad: 'ACTIVA',
        estadoMetricas: 'COMPLETA',
        mensaje: 'Campaña archivada exitosamente - métricas completas'
      };

      // Agregar al histórico
      const historico = get().historico;
      const nuevoHistorico = [...historico, datosHistorico];
      set({ historico: nuevoHistorico });

      // Guardar en localStorage
      localStorage.setItem('historico', JSON.stringify(nuevoHistorico));

      // Cambiar estado de la campaña a Archivada
      const campanas = get().campanas;
      const campanasActualizadas = campanas.map(c => {
        if (c.id === campana.id) {
          return {
            ...c,
            estado: 'Archivada' as Campana['estado'],
            ultimaActualizacion: ahora
          };
        }
        return c;
      });
      
      set({ campanas: campanasActualizadas });
      localStorage.setItem('campanas', JSON.stringify(campanasActualizadas));

      return { 
        exito: true, 
        mensaje: `Campaña ${campana.nombre} archivada exitosamente en la semana ${semanaISO}` 
      };
    } catch (error) {
      return { exito: false, mensaje: `Error archivando campaña: ${error}` };
    }
  },

  importarHistorico: async (datosHistorico: any[]) => {
    try {
      const historico = get().historico;
      const nuevosRegistros: HistoricoSemanal[] = [];

      for (const registro of datosHistorico) {
        const fechaArchivo = new Date(registro.FECHA_ARCHIVO.split(' ')[0].split('/').reverse().join('-'));
        
        const nuevoRegistro: HistoricoSemanal = {
          id: `${registro.ID_CAMPANIA}-${registro.SEMANA_ISO}`,
          idCampana: registro.ID_CAMPANIA,
          nombre: registro.NOMBRE_CAMPANIA,
          semanaISO: parseInt(registro.SEMANA_ISO.toString()),
          fechaArchivo: fechaArchivo,
          pais: 'PE', // Por defecto, se puede mapear desde vertical
          vertical: registro.VERTICAL as Vertical || 'MOTOPER',
          plataforma: 'FB', // Por defecto, se puede extraer del nombre
          segmento: registro.SEGMENTO as Segmento || 'Adquisición',
          objetivo: registro.OBJETIVO,
          beneficio: registro.BENEFICIO_PROGRAMA,
          descripcion: registro.DESCRIPCION,
          nombreDueno: 'Importado',
          
          // Métricas del trafficker
          alcance: registro.ALCANCE || undefined,
          clics: registro.CLICKS || undefined,
          leads: registro.LEADS || undefined,
          costoSemanal: registro.COSTO_SEMANAL || undefined,
          costoLead: registro.COSTO_LEAD || undefined,
          
          // Métricas del dueño
          conductoresRegistrados: registro.CONDUCTORES_REGISTRADOS || undefined,
          conductoresPrimerViaje: registro.CONDUCTORES_PRIMER_VIAJE || undefined,
          costoConductorRegistrado: registro.COSTO_CONDUCTOR_REGISTRADO || undefined,
          costoConductorPrimerViaje: registro.COSTO_CONDUCTOR_PRIMER_VIAJE || undefined,
          
          // Estados
          estadoActividad: registro.ESTADO_ACTIVIDAD,
          estadoMetricas: registro.ESTADO_METRICAS,
          mensaje: registro.MENSAJE || 'Importado desde Google Sheets'
        };

        nuevosRegistros.push(nuevoRegistro);
      }

      const historicoActualizado = [...historico, ...nuevosRegistros];
      set({ historico: historicoActualizado });
      localStorage.setItem('historico', JSON.stringify(historicoActualizado));

      return { 
        exito: true, 
        mensaje: `${nuevosRegistros.length} registros históricos importados exitosamente` 
      };
    } catch (error) {
      return { exito: false, mensaje: `Error importando histórico: ${error}` };
    }
  },

  obtenerCampanas: () => {
    const campanasGuardadas = localStorage.getItem('campanas');
    if (campanasGuardadas) {
      const campanas = JSON.parse(campanasGuardadas);
      campanas.forEach((c: Campana) => {
        c.fechaCreacion = new Date(c.fechaCreacion);
        c.ultimaActualizacion = new Date(c.ultimaActualizacion);
      });
      set({ campanas });
    }
  },

  obtenerHistorico: () => {
    const historicoGuardado = localStorage.getItem('historico');
    if (historicoGuardado) {
      const historico = JSON.parse(historicoGuardado);
      historico.forEach((h: HistoricoSemanal) => {
        h.fechaArchivo = new Date(h.fechaArchivo);
      });
      set({ historico });
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
    }
  },

  seleccionarCampana: (campana: Campana | null) => {
    set({ campanaSeleccionada: campana });
  },

  eliminarCampana: (idCampana: string) => {
    const campanas = get().campanas.filter(c => c.id !== idCampana);
    set({ campanas });
    localStorage.setItem('campanas', JSON.stringify(campanas));
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
        // Actualizar registro existente
        historicoActualizado = [...historicoSemanasCampanas];
        historicoActualizado[indiceExistente] = nuevoRegistro;
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

function verificarMetricasCompletas(campana: Campana): boolean {
  // Verificar métricas del trafficker
  const metricasTrafficker = campana.alcance && campana.clics && campana.leads && campana.costoSemanal && campana.costoLead;
  
  // Verificar métricas del dueño
  const metricasDueno = campana.conductoresRegistrados !== undefined && campana.conductoresPrimerViaje !== undefined;
  
  return !!(metricasTrafficker && metricasDueno);
}

function obtenerSemanaISO(fecha: Date): number {
  const d = new Date(fecha);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 + week1.getDay() + 1) / 7);
}

