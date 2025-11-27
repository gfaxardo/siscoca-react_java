import { ReactNode, useState, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardConfigurable from '../Dashboard/DashboardConfigurable';
import DashboardTareas from '../Tareas/DashboardTareas';
import InboxMessages from '../Chat/InboxMessages';
import { X } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  vistaActiva?: string;
  onCambiarVista?: (vista: string) => void;
  onCrearNueva?: () => void;
  onImportarCampanas?: () => void;
  onVerHistorico?: () => void;
  onAbrirDashboard?: () => void;
}

export default function Layout({ 
  children, 
  vistaActiva,
  onCambiarVista,
  onCrearNueva,
  onImportarCampanas,
  onVerHistorico,
  onAbrirDashboard: _onAbrirDashboard
}: LayoutProps) {
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [mostrarTareas, setMostrarTareas] = useState(false);
  const [mostrarInbox, setMostrarInbox] = useState(false);
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  // Detectar tamaño de pantalla y ajustar sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Desktop: sidebar siempre abierto
        setSidebarAbierto(true);
      } else {
        // Móvil: sidebar cerrado por defecto
        setSidebarAbierto(false);
      }
    };

    // Ejecutar al montar
    handleResize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      {onCambiarVista && (
        <Sidebar
          abierto={sidebarAbierto}
          vistaActiva={vistaActiva || 'dashboard'}
          onCambiarVista={(vista) => {
            onCambiarVista(vista);
            // Cerrar sidebar solo en móviles después de seleccionar
            if (window.innerWidth < 1024) {
              setSidebarAbierto(false);
            }
          }}
          onCrearNueva={onCrearNueva || (() => {})}
          onImportarCampanas={onImportarCampanas || (() => {})}
          onVerHistorico={onVerHistorico || (() => {})}
          onCerrar={() => {
            // Solo cerrar en móviles
            if (window.innerWidth < 1024) {
              setSidebarAbierto(false);
            }
          }}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          onAbrirTareas={() => setMostrarTareas(true)}
          onAbrirInbox={() => setMostrarInbox(true)}
          vistaActiva={vistaActiva}
          onCambiarVista={onCambiarVista}
          onToggleSidebar={() => setSidebarAbierto(!sidebarAbierto)}
        />
        
        <main className="flex-1 overflow-y-scroll p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-slate-100" style={{ scrollBehavior: 'smooth' }}>
          {children}
        </main>
      </div>

      {/* Modal de Dashboard Configurable */}
      {mostrarDashboard && (
        <DashboardConfigurable
          onCerrar={() => setMostrarDashboard(false)}
        />
      )}

      {/* Modal de Tareas Pendientes */}
      {mostrarTareas && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Mis Tareas</h2>
              <button
                onClick={() => setMostrarTareas(false)}
                className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
              <DashboardTareas />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inbox */}
      {mostrarInbox && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-800 p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Inbox</h2>
              <button
                onClick={() => setMostrarInbox(false)}
                className="text-gray-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[calc(90vh-80px)]">
              <InboxMessages />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

