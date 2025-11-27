import { BarChart3, Zap, TrendingUp, FileText, Settings, Plus, Upload, Clock, X } from 'lucide-react';

interface SidebarProps {
  abierto: boolean;
  vistaActiva: string;
  onCambiarVista: (vista: string) => void;
  onCrearNueva: () => void;
  onImportarCampanas: () => void;
  onVerHistorico: () => void;
  onCerrar?: () => void;
}

type Vista = 'dashboard' | 'campanas' | 'historico' | 'auditoria' | 'administracion';

export default function Sidebar({ 
  abierto, 
  vistaActiva, 
  onCambiarVista, 
  onCrearNueva, 
  onImportarCampanas, 
  onVerHistorico,
  onCerrar 
}: SidebarProps) {

  const menuItems = [
    { 
      id: 'dashboard' as Vista, 
      texto: 'Dashboard', 
      badge: null,
      Icon: BarChart3
    },
    { 
      id: 'campanas' as Vista, 
      texto: 'Campañas', 
      badge: null,
      Icon: Zap
    },
    { 
      id: 'historico' as Vista, 
      texto: 'Histórico', 
      badge: null,
      Icon: TrendingUp
    },
    { 
      id: 'auditoria' as Vista, 
      texto: 'Auditoría', 
      badge: null,
      Icon: FileText
    },
    { 
      id: 'administracion' as Vista, 
      texto: 'Administración', 
      badge: null,
      Icon: Settings
    },
  ];

  const accionesRapidas = [
    {
      id: 'nueva',
      texto: 'Nueva Campaña',
      onClick: onCrearNueva,
      Icon: Plus
    },
    {
      id: 'importar',
      texto: 'Importar Datos',
      onClick: onImportarCampanas,
      Icon: Upload
    },
    {
      id: 'historico',
      texto: 'Ver Histórico',
      onClick: onVerHistorico,
      Icon: Clock
    },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {abierto && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={onCerrar}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:relative top-0 left-0 h-full z-50 lg:z-auto
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900
          border-r border-white/10 transition-all duration-300 
          ${abierto ? 'w-72' : 'w-0 lg:w-72'} 
          overflow-hidden shadow-2xl lg:shadow-none
        `}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <div className="mb-8 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg">SISCOCA 2.0</h2>
                <p className="text-gray-400 text-xs">Gestión de Campañas</p>
              </div>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Menú Principal
              </p>
              {menuItems.map((item) => {
                const isActive = vistaActiva === item.id;
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onCambiarVista(item.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-xl 
                      transition-all duration-200 text-left group relative overflow-hidden
                      ${isActive 
                        ? 'text-white shadow-lg' 
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }
                    `}
                    style={isActive ? {
                      background: 'linear-gradient(to right, #ef0000, #dc0000)',
                    } : {}}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-20 blur-xl"></div>
                    )}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`
                        transition-transform duration-200
                        ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                      `}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{item.texto}</span>
                    </div>
                    {item.badge && (
                      <span className="relative z-10 px-2 py-1 text-xs font-bold rounded-full" style={{ backgroundColor: '#ef0000', color: 'white' }}>
                        {item.badge}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full" style={{ backgroundColor: '#ffffff' }}></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Acciones Rápidas */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
                Acciones Rápidas
              </p>
              <div className="space-y-1">
                {accionesRapidas.map((accion) => {
                  const Icon = accion.Icon;
                  return (
                    <button 
                      key={accion.id}
                      onClick={accion.onClick}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(239, 0, 0, 0.15)' }}>
                        <Icon className="w-4 h-4 text-red-400 group-hover:text-white transition-colors" />
                      </div>
                      <span className="font-medium">{accion.texto}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-semibold text-sm mb-1">SISCOCA 2.0</p>
              <p className="text-gray-400 text-xs">v2.0.0</p>
              <p className="text-gray-500 text-xs mt-2">Tío Yego Developments</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

