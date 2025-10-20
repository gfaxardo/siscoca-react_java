// import React from 'react';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface ApiErrorAlertProps {
  error: ApiError | null;
  onClose: () => void;
  className?: string;
}

export default function ApiErrorAlert({ error, onClose, className = '' }: ApiErrorAlertProps) {
  if (!error) return null;

  const getErrorIcon = () => {
    if (error.status === 401) return '🔐';
    if (error.status === 403) return '🚫';
    if (error.status === 404) return '🔍';
    if (error.status === 500) return '⚠️';
    return '❌';
  };

  const getErrorTitle = () => {
    if (error.status === 401) return 'Sesión Expirada';
    if (error.status === 403) return 'Acceso Denegado';
    if (error.status === 404) return 'No Encontrado';
    if (error.status === 500) return 'Error del Servidor';
    return 'Error de Conexión';
  };

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">{getErrorIcon()}</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {getErrorTitle()}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message}</p>
            {error.status && (
              <p className="mt-1 text-xs text-red-600">
                Código de error: {error.status}
              </p>
            )}
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                type="button"
                onClick={onClose}
                className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
              >
                Cerrar
              </button>
              {error.status === 401 && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="ml-3 bg-red-100 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                >
                  Reiniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
