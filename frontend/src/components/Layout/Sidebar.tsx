interface SidebarProps {
  abierto: boolean;
  vistaActiva: string;
  onCambiarVista: (vista: string) => void;
  onCrearNueva: () => void;
  onImportarCampanas: () => void;
  onVerHistorico: () => void;
}

type Vista = 'dashboard' | 'campanas' | 'historico';

export default function Sidebar({ 
  abierto, 
  vistaActiva, 
  onCambiarVista, 
  onCrearNueva, 
  onImportarCampanas, 
  onVerHistorico 
}: SidebarProps) {

  const menuItems = [
    { id: 'dashboard' as Vista, icono: '📊', texto: 'Dashboard', badge: null },
    { id: 'campanas' as Vista, icono: '🎯', texto: 'Campañas', badge: null },
    { id: 'historico' as Vista, icono: '📈', texto: 'Histórico', badge: null },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {abierto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => onCambiarVista(vistaActiva)} // Cerrar al hacer click fuera
        />
      )}
      
      {/* Sidebar emergente */}
      <aside 
        className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          bg-white border-r border-gray-200 transition-all duration-300 
          ${abierto ? 'w-64' : 'w-0 lg:w-0'} 
          overflow-hidden shadow-lg lg:shadow-none
        `}
      >
        <div className="p-4 lg:p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onCambiarVista(item.id)}
              className={`
                w-full flex items-center justify-between px-3 py-2 rounded-lg 
                transition-colors duration-200 text-left text-sm
                ${vistaActiva === item.id 
                  ? 'bg-primary-50 text-primary-700 font-semibold' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">{item.icono}</span>
                <span className="text-sm">{item.texto}</span>
              </div>
              {item.badge && (
                <span className="bg-primary-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Acciones Rápidas
          </h3>
          <div className="space-y-1">
            <button 
              onClick={onCrearNueva}
              className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📝</span>
              <span>Nueva Campaña</span>
            </button>
            <button 
              onClick={onImportarCampanas}
              className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📊</span>
              <span>Importar Campañas</span>
            </button>
            <button 
              onClick={onVerHistorico}
              className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span>📈</span>
              <span>Ver Histórico</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p className="font-semibold">SISCOCA 2.0</p>
            <p className="mt-1">v2.0.0</p>
          </div>
        </div>
        </div>
      </aside>
    </>
  );
}

