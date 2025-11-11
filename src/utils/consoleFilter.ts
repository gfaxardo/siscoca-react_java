/**
 * Filtra errores de extensiones de Chrome que no son relevantes para SISCOCA
 * Esto ayuda a mantener la consola limpia y enfocada en errores reales de la aplicación
 */

export function setupConsoleFilter() {
  // Guardar el console.error original
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // Lista de patrones a filtrar (errores de extensiones conocidas)
  const filterPatterns = [
    /permission error/i,
    /\/generate\/tone/i,
    /\/writing\/get_template_list/i,
    /\/site_integration\/template_list/i,
    /content\.js/i,
    /background\.js/i,
    /chrome-extension:/i,
    /extension/i,
    /UserAuthError/i
  ];

  // Función para verificar si un error debe ser filtrado
  function shouldFilterError(args: any[]): boolean {
    const errorString = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.message + ' ' + arg.stack;
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ').toLowerCase();

    return filterPatterns.some(pattern => pattern.test(errorString));
  }

  // Sobrescribir console.error
  console.error = (...args: any[]) => {
    if (!shouldFilterError(args)) {
      originalConsoleError.apply(console, args);
    }
    // Si debe filtrarse, simplemente no se muestra
  };

  // Sobrescribir console.warn (algunas extensiones usan warn)
  console.warn = (...args: any[]) => {
    if (!shouldFilterError(args)) {
      originalConsoleWarn.apply(console, args);
    }
  };

  // También interceptar errores no capturados de promesas
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const error = event.reason;
    const errorString = error?.message || String(error);
    
    // Verificar si el error es de una extensión
    const shouldFilter = filterPatterns.some(pattern => 
      pattern.test(errorString) || 
      (error?.reqInfo?.pathPrefix && filterPatterns.some(p => p.test(error.reqInfo.pathPrefix)))
    );

    if (shouldFilter) {
      // Prevenir que el error se muestre en la consola
      event.preventDefault();
      return;
    }
    // Si no es de extensión, el error se manejará normalmente por el navegador
  });
}



