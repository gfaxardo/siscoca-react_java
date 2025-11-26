interface SidebarProps {
  abierto: boolean;
  vistaActiva: string;
  onCambiarVista: (vista: string) => void;
  onCrearNueva: () => void;
  onImportarCampanas: () => void;
  onVerHistorico: () => void;
}

type Vista = 'dashboard' | 'campanas' | 'historico' | 'auditoria' | 'administracion';

export default function Sidebar({ 
  abierto, 
  vistaActiva, 
  onCambiarVista, 
  onCrearNueva, 
  onImportarCampanas, 
  onVerHistorico 
}: SidebarProps) {

  const menuItems = [
    { 
      id: 'dashboard' as Vista, 
      texto: 'Dashboard', 
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      id: 'campanas' as Vista, 
      texto: 'Campañas', 
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      id: 'historico' as Vista, 
      texto: 'Histórico', 
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      )
    },
    { 
      id: 'auditoria' as Vista, 
      texto: 'Auditoría', 
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'administracion' as Vista, 
      texto: 'Administración', 
      badge: null,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  const accionesRapidas = [
    {
      id: 'nueva',
      texto: 'Nueva Campaña',
      onClick: onCrearNueva,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )
    },
    {
      id: 'importar',
      texto: 'Importar Datos',
      onClick: onImportarCampanas,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      id: 'historico',
      texto: 'Ver Histórico',
      onClick: onVerHistorico,
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* Overlay para móviles */}
      {abierto && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={() => onCambiarVista(vistaActiva)}
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
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
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
                        {item.icon}
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
                {accionesRapidas.map((accion) => (
                  <button 
                    key={accion.id}
                    onClick={accion.onClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200 group"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(239, 0, 0, 0.15)' }}>
                      <div className="text-red-400 group-hover:text-white transition-colors">
                        {accion.icon}
                      </div>
                    </div>
                    <span className="font-medium">{accion.texto}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center border border-white/10">
              <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
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

