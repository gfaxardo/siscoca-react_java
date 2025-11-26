import { useState, useRef, useEffect } from 'react';
import { Menu } from 'lucide-react';

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
      {/* Botón del menú */}
      <button
        onClick={() => setMostrarMenu(!mostrarMenu)}
        className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
        title="Menú de acciones"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Menú desplegable */}
      {mostrarMenu && (
        <div className="absolute left-0 top-full mt-2 w-72 bg-slate-800 rounded-xl shadow-2xl border border-white/20 z-50 overflow-hidden backdrop-blur-xl">
          {/* Header del menú */}
          <div className="px-4 py-3 border-b border-white/10" style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}>
            <h3 className="text-white font-bold text-sm">
              {vistaActiva === 'dashboard' && 'Dashboard'}
              {vistaActiva === 'campanas' && 'Campañas'}
              {vistaActiva === 'historico' && 'Histórico'}
              {vistaActiva === 'auditoria' && 'Auditoría'}
              {vistaActiva === 'administracion' && 'Administración'}
              {!vistaActiva && 'Sistema'}
            </h3>
            <p className="text-white/80 text-xs mt-1">Acciones disponibles</p>
          </div>

          {/* Lista de acciones */}
          <div className="max-h-96 overflow-y-auto">
            {acciones.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-400 text-sm">
                No hay acciones disponibles
              </div>
            ) : (
              acciones.map((accion) => (
                <button
                  key={accion.id}
                  onClick={() => {
                    accion.onClick();
                    setMostrarMenu(false);
                  }}
                  className={`w-full px-4 py-3 text-left transition-colors flex items-center space-x-3 border-b border-white/10 last:border-b-0 ${
                    accion.peligroso ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <span className="text-xl">{accion.icono}</span>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${accion.peligroso ? 'text-red-400' : 'text-white'}`}>
                      {accion.label}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/10">
            <div className="text-xs text-gray-500 text-center">
              SISCOCA v2.0.0
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







