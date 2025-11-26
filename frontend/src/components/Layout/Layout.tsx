import { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import DashboardConfigurable from '../Dashboard/DashboardConfigurable';
import DashboardTareas from '../Tareas/DashboardTareas';
import InboxMessages from '../Chat/InboxMessages';

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
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      {onCambiarVista && (
        <Sidebar
          abierto={sidebarAbierto}
          vistaActiva={vistaActiva || 'dashboard'}
          onCambiarVista={(vista) => {
            onCambiarVista(vista);
            setSidebarAbierto(false); // Cerrar en móviles después de seleccionar
          }}
          onCrearNueva={onCrearNueva || (() => {})}
          onImportarCampanas={onImportarCampanas || (() => {})}
          onVerHistorico={onVerHistorico || (() => {})}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          onAbrirDashboard={_onAbrirDashboard || (() => setMostrarDashboard(true))}
          onAbrirTareas={() => setMostrarTareas(true)}
          onAbrirInbox={() => setMostrarInbox(true)}
          vistaActiva={vistaActiva}
          onCambiarVista={onCambiarVista}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-br from-slate-50 to-slate-100">
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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

