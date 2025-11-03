import { useState, useEffect } from 'react';

interface Breakpoints {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
  isLargeDesktop: boolean;
  width: number;
  height: number;
}

export function useResponsive(): Breakpoints {
  const [breakpoints, setBreakpoints] = useState<Breakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isSmallMobile: false,
    isLargeDesktop: false,
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setBreakpoints({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isSmallMobile: width < 640,
        isLargeDesktop: width >= 1280,
        width,
        height,
      });
    };

    // Actualizar al montar
    updateBreakpoints();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', updateBreakpoints);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
}

// Hook para obtener clases CSS responsivas
export function useResponsiveClasses() {
  const { isMobile, isSmallMobile } = useResponsive();

  return {
    // Padding responsivo
    padding: isSmallMobile ? 'p-2' : isMobile ? 'p-3' : 'p-4 lg:p-6',
    
    // Espaciado responsivo
    spacing: isSmallMobile ? 'space-y-2' : isMobile ? 'space-y-3' : 'space-y-4 lg:space-y-6',
    
    // Grid responsivo
    grid: isSmallMobile ? 'grid-cols-1' : isMobile ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    
    // Texto responsivo
    text: {
      xs: isSmallMobile ? 'text-xs' : 'text-xs lg:text-sm',
      sm: isSmallMobile ? 'text-xs' : 'text-sm lg:text-base',
      base: isSmallMobile ? 'text-sm' : 'text-sm lg:text-base',
      lg: isSmallMobile ? 'text-base' : 'text-base lg:text-lg',
      xl: isSmallMobile ? 'text-lg' : 'text-lg lg:text-xl',
      '2xl': isSmallMobile ? 'text-xl' : 'text-xl lg:text-2xl',
    },
    
    // Botones responsivos
    button: isSmallMobile ? 'px-3 py-1.5 text-xs' : isMobile ? 'px-4 py-2 text-sm' : 'px-4 py-2 lg:px-6 lg:py-3 text-sm',
    
    // Inputs responsivos
    input: isSmallMobile ? 'px-2 py-1.5 text-xs' : isMobile ? 'px-3 py-2 text-sm' : 'px-3 py-2 lg:px-4 lg:py-3 text-sm',
    
    // Modales responsivos
    modal: {
      container: isSmallMobile ? 'p-2' : 'p-2 sm:p-4',
      content: isSmallMobile ? 'max-w-full mx-2' : 'max-w-4xl lg:max-w-5xl',
      padding: isSmallMobile ? 'p-3' : 'p-4 lg:p-6',
    },
    
    // Tarjetas responsivas
    card: {
      padding: isSmallMobile ? 'p-3' : 'p-4 lg:p-6',
      gap: isSmallMobile ? 'gap-2' : 'gap-3 lg:gap-4',
      title: isSmallMobile ? 'text-sm' : 'text-sm lg:text-base',
    },
  };
}

// Hook para detectar si el sidebar debe estar abierto
export function useSidebarState() {
  const { isDesktop } = useResponsive();
  const [isOpen, setIsOpen] = useState(isDesktop);

  useEffect(() => {
    if (isDesktop) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isDesktop]);

  return {
    isOpen,
    setIsOpen,
    shouldAutoClose: !isDesktop,
  };
}
