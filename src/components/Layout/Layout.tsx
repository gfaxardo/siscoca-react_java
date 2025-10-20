import { ReactNode, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  vistaActiva: string;
  onCambiarVista: (vista: string) => void;
  onCrearNueva: () => void;
  onImportarCampanas: () => void;
  onVerHistorico: () => void;
}

export default function Layout({ 
  children, 
  vistaActiva, 
  onCambiarVista, 
  onCrearNueva, 
  onImportarCampanas, 
  onVerHistorico 
}: LayoutProps) {
  const [sidebarAbierto, setSidebarAbierto] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        abierto={sidebarAbierto}
        vistaActiva={vistaActiva}
        onCambiarVista={onCambiarVista}
        onCrearNueva={onCrearNueva}
        onImportarCampanas={onImportarCampanas}
        onVerHistorico={onVerHistorico}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setSidebarAbierto(!sidebarAbierto)} 
          sidebarAbierto={sidebarAbierto}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

