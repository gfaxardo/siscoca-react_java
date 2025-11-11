import { ReactNode, useState } from 'react';
import Header from './Header';
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
  onAbrirDashboard: _onAbrirDashboard
}: LayoutProps) {
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [mostrarTareas, setMostrarTareas] = useState(false);
  const [mostrarInbox, setMostrarInbox] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Header 
          onAbrirDashboard={_onAbrirDashboard || (() => setMostrarDashboard(true))}
          onAbrirTareas={() => setMostrarTareas(true)}
          onAbrirInbox={() => setMostrarInbox(true)}
          vistaActiva={vistaActiva}
          onCambiarVista={onCambiarVista}
        />
        
        <main className="flex-1 overflow-y-auto p-3 lg:p-6">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Mis Tareas</h2>
              <button
                onClick={() => setMostrarTareas(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖️ Cerrar
              </button>
            </div>
            <div className="p-4">
              <DashboardTareas />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inbox */}
      {mostrarInbox && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Inbox</h2>
              <button
                onClick={() => setMostrarInbox(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✖️ Cerrar
              </button>
            </div>
            <div className="p-4">
              <InboxMessages />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

