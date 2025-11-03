import { useState, useRef, useEffect } from 'react';

interface AccionMenu {
  id: string;
  label: string;
  icono: string;
  onClick: () => void;
  color: string;
  peligroso?: boolean;
}

interface MenuContextualProps {
  vistaActiva?: string;
  acciones: AccionMenu[];
}

export default function MenuContextual({ vistaActiva, acciones }: MenuContextualProps) {
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMostrarMenu(false);
      }
    };

    if (mostrarMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mostrarMenu]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón SISCOCA 2.0 */}
      <button
        onClick={() => setMostrarMenu(!mostrarMenu)}
        className="text-base lg:text-xl font-bold text-gray-800 hover:text-primary-600 transition-colors cursor-pointer flex items-center space-x-1"
      >
        <span>🎯</span>
        <span>SISCOCA 2.0</span>
        <span className={`text-xs transition-transform duration-200 ${mostrarMenu ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Menú desplegable */}
      {mostrarMenu && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header del menú */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3">
            <h3 className="text-white font-bold text-sm">
              {vistaActiva === 'dashboard' && '📊 Dashboard'}
              {vistaActiva === 'campanas' && '🎯 Campañas'}
              {vistaActiva === 'historico' && '📈 Histórico'}
              {vistaActiva === 'auditoria' && '📋 Auditoría'}
              {vistaActiva === 'administracion' && '⚙️ Administración'}
              {!vistaActiva && '🎯 Sistema'}
            </h3>
            <p className="text-primary-100 text-xs mt-1">Acciones disponibles</p>
          </div>

          {/* Lista de acciones */}
          <div className="max-h-96 overflow-y-auto">
            {acciones.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No hay acciones disponibles para esta vista
              </div>
            ) : (
              acciones.map((accion) => (
                <button
                  key={accion.id}
                  onClick={() => {
                    accion.onClick();
                    setMostrarMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-b-0 ${
                    accion.peligroso ? 'hover:bg-red-50' : ''
                  }`}
                >
                  <span className="text-xl">{accion.icono}</span>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${accion.peligroso ? 'text-red-600' : 'text-gray-900'}`}>
                      {accion.label}
                    </div>
                  </div>
                  <span className="text-xs opacity-50">{accion.color}</span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              SISCOCA v2.0.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



