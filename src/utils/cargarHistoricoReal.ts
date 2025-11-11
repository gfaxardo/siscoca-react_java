// Función para cargar directamente los datos del CSV real al histórico
export const cargarHistoricoReal = async () => {
  // Datos reales del CSV "SisCoCa 2.0 - Histórico Semanal.csv"
  const datosReales = [
    {
      FECHA_ARCHIVO: "20/09/2025 16:24",
      ID_CAMPANIA: "C5",
      NOMBRE_CAMPANIA: "Conductores a2a o superior turno día",
      SEMANA_ISO: 39,
      ESTADO_ACTIVIDAD: "ACTIVA",
      ESTADO_METRICAS: "Métricas no actualizadas en el rango de tiempo permitido (00:00-12:59)",
      MENSAJE: "Campaña activa",
      ALCANCE: 272,
      CLICKS: 42,
      LEADS: 5.00,
      COSTO_SEMANAL: 35.95,
      COSTO_LEAD: 2.00,
      CONDUCTORES_REGISTRADOS: 2,
      CONDUCTORES_PRIMER_VIAJE: 2,
      COSTO_CONDUCTOR_REGISTRADO: 17.98,
      COSTO_CONDUCTOR_PRIMER_VIAJE: 17.98,
      FECHA_CREACION: "18/09/2025 15:00",
      ULTIMA_ACTUALIZACION: "18/09/2025 15:03",
      OBJETIVO: "Reclutar 15 conductores mensuales que estén operativos, el factor de conversión es 5%, entonces estimamos 300 leads mes.",
      SEGMENTO: "Adquisición",
      VERTICAL: "Yego Pro",
      BENEFICIO_PROGRAMA: "Gana hasta S/.1000 semanales si tienes licencia a 2a o superior.",
      DESCRIPCION: "Yego Pro es un Programa que busca darle al conductor la forma de trabajar en Yango así no tenga vehiculo con nuestro grupo de vehiculos propios y se busca conductores con licencia a2a",
      URL_INFORME: "https://docs.google.com/document/d/1QsgnzVjiolXv2sdHVrmzCQx8KUBuXxzLsjkKSGo0z2Y/edit?tab=t.0"
    },
    {
      FECHA_ARCHIVO: "22/09/2025 13:43",
      ID_CAMPANIA: "C5",
      NOMBRE_CAMPANIA: "Conductores a2a o superior turno día",
      SEMANA_ISO: 40,
      ESTADO_ACTIVIDAD: "ACTIVA",
      ESTADO_METRICAS: "Métricas incompletas - faltan datos del trafficker o dueño",
      MENSAJE: "Campaña activa",
      ALCANCE: 0,
      CLICKS: 0,
      LEADS: 0,
      COSTO_SEMANAL: 0,
      COSTO_LEAD: 0,
      CONDUCTORES_REGISTRADOS: 0,
      CONDUCTORES_PRIMER_VIAJE: 0,
      COSTO_CONDUCTOR_REGISTRADO: 0,
      COSTO_CONDUCTOR_PRIMER_VIAJE: 0,
      FECHA_CREACION: "18/09/2025 15:00",
      ULTIMA_ACTUALIZACION: "18/09/2025 15:03",
      OBJETIVO: "Reclutar 15 conductores mensuales que estén operativos, el factor de conversión es 5%, entonces estimamos 300 leads mes.",
      SEGMENTO: "Adquisición",
      VERTICAL: "Yego Pro",
      BENEFICIO_PROGRAMA: "Gana hasta S/.1000 semanales si tienes licencia a 2a o superior.",
      DESCRIPCION: "Yego Pro es un Programa que busca darle al conductor la forma de trabajar en Yango así no tenga vehiculo con nuestro grupo de vehiculos propios y se busca conductores con licencia a2a",
      URL_INFORME: ""
    },
    {
      FECHA_ARCHIVO: "29/09/2025 13:43",
      ID_CAMPANIA: "C5",
      NOMBRE_CAMPANIA: "C68 - YEGO PRO - LIMA JUL 2025",
      SEMANA_ISO: 41,
      ESTADO_ACTIVIDAD: "ACTIVA",
      ESTADO_METRICAS: "Métricas incompletas - faltan datos del trafficker o dueño",
      MENSAJE: "Campaña activa",
      ALCANCE: 165,
      CLICKS: 107,
      LEADS: 35.95,
      COSTO_SEMANAL: 0.34,
      COSTO_LEAD: 1,
      CONDUCTORES_REGISTRADOS: 1,
      CONDUCTORES_PRIMER_VIAJE: 1,
      COSTO_CONDUCTOR_REGISTRADO: 35.95,
      COSTO_CONDUCTOR_PRIMER_VIAJE: 35.95,
      FECHA_CREACION: "18/09/2025 15:00",
      ULTIMA_ACTUALIZACION: "29/09/2025 12:18",
      OBJETIVO: "Reclutar 15 conductores mensuales que estén operativos, el factor de conversión es 5%, entonces estimamos 300 leads mes.",
      SEGMENTO: "Adquisición",
      VERTICAL: "C68 - Yego Pro",
      BENEFICIO_PROGRAMA: "Gana hasta S/.1000 semanales si tienes licencia a 2a o superior.",
      DESCRIPCION: "Yego Pro es un Programa que busca darle al conductor la forma de trabajar en Yango así no tenga vehiculo con nuestro grupo de vehiculos propios y se busca conductores con licencia a2a",
      URL_INFORME: "https://docs.google.com/document/d/1vemxtfjb_GCr6cj95wYidpTf5PkdkEDkdYy3XwoWFnw/edit?usp=sharing"
    },
    {
      FECHA_ARCHIVO: "29/09/2025 13:43",
      ID_CAMPANIA: "C6",
      NOMBRE_CAMPANIA: "C77 - INGRESO GARANTIZADO LIMA, TRUJILLO, AREQUIPA",
      SEMANA_ISO: 41,
      ESTADO_ACTIVIDAD: "FINALIZADA",
      ESTADO_METRICAS: "Métricas incompletas - faltan datos del trafficker o dueño",
      MENSAJE: "Campaña finalizada - ya no está activa",
      ALCANCE: 143,
      CLICKS: 18,
      LEADS: 16.8,
      COSTO_SEMANAL: 0.93,
      COSTO_LEAD: 0,
      CONDUCTORES_REGISTRADOS: 0,
      CONDUCTORES_PRIMER_VIAJE: 0,
      COSTO_CONDUCTOR_REGISTRADO: 0,
      COSTO_CONDUCTOR_PRIMER_VIAJE: 0,
      FECHA_CREACION: "23/09/2025 12:40",
      ULTIMA_ACTUALIZACION: "29/09/2025 12:31",
      OBJETIVO: "Aumentar registro y viajes de los conductores",
      SEGMENTO: "Adquisición",
      VERTICAL: "Yego",
      BENEFICIO_PROGRAMA: "Ingresos garantizados",
      DESCRIPCION: "Ingreso neto garantizado es una campaña que estamos sacando asegurando un mínimo de lo que va a ganar el conductor de acuerdo a los viajes que haga, esto después de las comisiones, pagos de los pasajeros y bonos",
      URL_INFORME: "https://docs.google.com/document/d/1S18pzpFFzOdVbC2VXwcGF6n_LCY2QDifLtRvDd4fjko/edit?usp=sharing"
    },
    {
      FECHA_ARCHIVO: "29/09/2025 13:43",
      ID_CAMPANIA: "C8",
      NOMBRE_CAMPANIA: "C72 - DELIVERY YEGO BARRANQUILLA",
      SEMANA_ISO: 41,
      ESTADO_ACTIVIDAD: "ACTIVA",
      ESTADO_METRICAS: "Métricas actualizadas correctamente",
      MENSAJE: "Campaña activa",
      ALCANCE: 72,
      CLICKS: 37,
      LEADS: 19.9,
      COSTO_SEMANAL: 0.54,
      COSTO_LEAD: 30,
      CONDUCTORES_REGISTRADOS: 30,
      CONDUCTORES_PRIMER_VIAJE: 5,
      COSTO_CONDUCTOR_REGISTRADO: 0.66,
      COSTO_CONDUCTOR_PRIMER_VIAJE: 3.98,
      FECHA_CREACION: "23/09/2025 16:45",
      ULTIMA_ACTUALIZACION: "29/09/2025 12:34",
      OBJETIVO: "Adquirir 65 registros nuevos de conductores para Delivery en la ciudad de Barranquilla durante 4 semanas.",
      SEGMENTO: "Adquisición",
      VERTICAL: "Delivery Barranquilla",
      BENEFICIO_PROGRAMA: "más ingresos, estabilidad y soporte constante, gracias a los bonos semanales, bonos por referidos, asistencia 24/7, capacitaciones y tarifas mínimas aseguradas.",
      DESCRIPCION: "Campaña de captación de conductores nuevos para la Flota Dedicada Delivery en Barranquilla , con el respaldo de Yango.",
      URL_INFORME: "https://docs.google.com/document/d/1p7ptFqP7QseYA_nsdImhe6_EFwqFn8OtdmAyV99jN0c/edit?usp=sharing"
    }
  ];

  // Convertir a formato HistoricoSemanal y guardar directamente
  const historicoNuevo = datosReales.map(registro => {
    const fechaArchivo = new Date(registro.FECHA_ARCHIVO.split(' ')[0].split('/').reverse().join('-'));
    
    return {
      id: `${registro.ID_CAMPANIA}-${registro.SEMANA_ISO}`,
      idCampana: registro.ID_CAMPANIA,
      nombre: registro.NOMBRE_CAMPANIA,
      semanaISO: parseInt(registro.SEMANA_ISO.toString()),
      fechaArchivo: fechaArchivo,
      pais: 'PE' as const,
      vertical: registro.VERTICAL as any || 'MOTOPER',
      plataforma: 'FB' as const,
      segmento: registro.SEGMENTO as any || 'Adquisición',
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
      mensaje: registro.MENSAJE || 'Importado desde CSV'
    };
  });

  // Guardar directamente en localStorage
  localStorage.setItem('historico', JSON.stringify(historicoNuevo));
  
  return {
    exito: true,
    mensaje: `${historicoNuevo.length} registros del CSV cargados exitosamente al histórico`
  };
};
