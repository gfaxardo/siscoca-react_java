import toast from 'react-hot-toast';

/**
 * Hook personalizado para mostrar notificaciones modernas
 * Reemplaza los alert() por defecto con toasts bonitos
 */
export const useNotification = () => {
  const success = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(to right, #10b981, #059669)',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: '600',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: 'linear-gradient(to right, #ef0000, #dc0000)',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: '600',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef0000',
      },
    });
  };

  const warning = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: 'linear-gradient(to right, #f59e0b, #d97706)',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: '600',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  };

  const info = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: 'linear-gradient(to right, #3b82f6, #2563eb)',
        color: '#fff',
        padding: '16px',
        borderRadius: '12px',
        fontWeight: '600',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  };

  const promise = <T,>(
    promiseFunc: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(
      promiseFunc,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        position: 'top-right',
        style: {
          padding: '16px',
          borderRadius: '12px',
          fontWeight: '600',
        },
      }
    );
  };

  return { success, error, warning, info, promise };
};

