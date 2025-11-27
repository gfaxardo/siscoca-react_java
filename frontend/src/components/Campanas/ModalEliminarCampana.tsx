import { createPortal } from 'react-dom';
import { AlertTriangle, X, Trash2, Loader2 } from 'lucide-react';
import { Campana } from '../../types';

interface ModalEliminarCampanaProps {
  campana: Campana;
  onConfirmar: () => Promise<void>;
  onCancelar: () => void;
  isLoading?: boolean;
}

export default function ModalEliminarCampana({ 
  campana, 
  onConfirmar, 
  onCancelar,
  isLoading = false 
}: ModalEliminarCampanaProps) {
  
  const handleConfirmar = async () => {
    await onConfirmar();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header con alerta */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 px-6 py-5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Eliminar Campaña
                </h2>
                <p className="text-red-100 text-sm">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            <button
              onClick={onCancelar}
              disabled={isLoading}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6">
          {/* Mensaje de advertencia */}
          <div className="bg-red-50 border-l-4 border-red-600 rounded-lg p-4 mb-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900 mb-2">
                  ⚠️ ADVERTENCIA: Esta acción es permanente
                </p>
                <p className="text-sm text-red-800">
                  Estás a punto de eliminar completamente esta campaña del sistema.
                  Todos los datos asociados serán borrados de forma permanente.
                </p>
              </div>
            </div>
          </div>

          {/* Información de la campaña */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-5 border border-gray-200">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Campaña a eliminar:
            </p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-sm font-bold text-gray-900 min-w-[60px]">Nombre:</span>
                <span className="text-sm text-gray-800 font-medium break-words flex-1">
                  {campana.nombre}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-bold text-gray-900 min-w-[60px]">ID:</span>
                <span className="text-sm text-gray-800 font-medium">
                  #{campana.id}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-sm font-bold text-gray-900 min-w-[60px]">Estado:</span>
                <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${
                  campana.estado === 'Activa' 
                    ? 'bg-green-100 text-green-800' 
                    : campana.estado === 'Pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {campana.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Lista de lo que se perderá */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5">
            <p className="text-sm font-bold text-yellow-900 mb-3">
              Se eliminarán permanentemente:
            </p>
            <ul className="space-y-2 text-sm text-yellow-800">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
                <span className="font-medium">Todos los datos de la campaña</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
                <span className="font-medium">Métricas del trafficker y del dueño</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
                <span className="font-medium">Creativos asociados</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
                <span className="font-medium">Historial de cambios</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-600"></span>
                <span className="font-medium">Conversaciones del chat</span>
              </li>
            </ul>
          </div>

          {/* Confirmación final */}
          <div className="bg-gray-900 rounded-xl p-4 mb-5">
            <p className="text-white text-sm font-bold text-center">
              ¿Estás completamente seguro de que deseas continuar?
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancelar}
            disabled={isLoading}
            className="w-full sm:w-auto flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isLoading}
            className="w-full sm:w-auto flex-1 px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
            style={{ background: isLoading ? '#9ca3af' : 'linear-gradient(to right, #dc2626, #b91c1c)' }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Sí, Eliminar Definitivamente
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

