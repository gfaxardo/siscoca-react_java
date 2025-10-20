// Función para limpiar completamente todos los datos del sistema
export const limpiarTodosLosDatos = () => {
  try {
    // Limpiar localStorage completamente
    localStorage.removeItem('campanas');
    localStorage.removeItem('historico');
    localStorage.removeItem('campanaSeleccionada');
    
    // Limpiar cualquier otro dato que pueda estar guardado
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('siscoca') || key.includes('campana') || key.includes('historico')) {
        localStorage.removeItem(key);
      }
    });

    // También limpiar sessionStorage por si acaso
    sessionStorage.clear();

    return {
      exito: true,
      mensaje: '✅ Todos los datos del sistema han sido eliminados. El sistema está completamente limpio.'
    };
  } catch (error) {
    return {
      exito: false,
      mensaje: `❌ Error limpiando datos: ${error}`
    };
  }
};

// Función para resetear solo las campañas
export const limpiarCampanas = () => {
  try {
    localStorage.removeItem('campanas');
    localStorage.removeItem('campanaSeleccionada');
    
    return {
      exito: true,
      mensaje: '✅ Campañas eliminadas. Puedes empezar a crear nuevas campañas.'
    };
  } catch (error) {
    return {
      exito: false,
      mensaje: `❌ Error limpiando campañas: ${error}`
    };
  }
};

// Función para resetear solo el histórico
export const limpiarHistorico = () => {
  try {
    localStorage.removeItem('historico');
    
    return {
      exito: true,
      mensaje: '✅ Histórico eliminado. Puedes importar nuevos datos históricos.'
    };
  } catch (error) {
    return {
      exito: false,
      mensaje: `❌ Error limpiando histórico: ${error}`
    };
  }
};

