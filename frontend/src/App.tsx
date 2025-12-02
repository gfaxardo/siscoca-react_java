import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ApiErrorAlert from './components/ApiErrorAlert';
import { useApiError } from './hooks/useApiError';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ListaCampanas from './components/Campanas/ListaCampanas';
import ListaCampanasArchivadas from './components/Campanas/ListaCampanasArchivadas';
import VistaHistorico from './components/Historico/VistaHistorico';
import FormularioCrearCampana from './components/Campanas/FormularioCrearCampana';
import FormularioMetricasTrafficker from './components/Campanas/FormularioMetricasTrafficker';
import FormularioMetricasDueno from './components/Campanas/FormularioMetricasDueno';
import ImportarCampanas from './components/Campanas/ImportarCampanas';
import HistorialCambios from './components/Audit/HistorialCambios';
import GestionUsuarios from './components/Admin/GestionUsuarios';
import { useCampanaStore } from './store/useCampanaStore';
import { Campana } from './types';
import { Toaster } from 'react-hot-toast';
// import { cargarDatosEjemplo } from './utils/datosEjemplo';

type Vista = 'dashboard' | 'campanas' | 'historico' | 'auditoria' | 'administracion';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const { error, clearError } = useApiError();
  
  // Restaurar vista activa desde localStorage
  const getVistaInicial = (): Vista => {
    try {
      const vistaGuardada = localStorage.getItem('vistaActiva');
      if (vistaGuardada && ['dashboard', 'campanas', 'historico', 'auditoria', 'administracion'].includes(vistaGuardada)) {
        return vistaGuardada as Vista;
      }
    } catch (error) {
      console.error('Error leyendo vista guardada:', error);
    }
    return 'dashboard';
  };
  
  const [vistaActiva, setVistaActiva] = useState<Vista>(getVistaInicial);
  const [mostrarFormularioCrear, setMostrarFormularioCrear] = useState(false);
  const [campanaParaTrafficker, setCampanaParaTrafficker] = useState<Campana | null>(null);
  const [campanaParaDueno, setCampanaParaDueno] = useState<Campana | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  
  const { obtenerCampanas, obtenerHistorico } = useCampanaStore();

  // Guardar vista activa en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('vistaActiva', vistaActiva);
    } catch (error) {
      console.error('Error guardando vista activa:', error);
    }
  }, [vistaActiva]);

  // Cargar datos iniciales solo una vez según la vista activa
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Cargar datos según la vista activa inicial
      if (vistaActiva === 'dashboard') {
        // Dashboard necesita AMBOS: campanas y historico para métricas generales
        obtenerCampanas();
        obtenerHistorico();
      } else if (vistaActiva === 'campanas') {
        // Campanas necesita campanas activas Y histórico para mostrar gráficos
        obtenerCampanas();
        obtenerHistorico();
      } else if (vistaActiva === 'historico') {
        // Histórico solo necesita histórico
        obtenerHistorico();
      }
      // Para auditoria y administracion, esos componentes manejan sus propias APIs
    }
  }, [isAuthenticated, isLoading]); // Solo ejecutar una vez al autenticarse

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Mostrar login si no está autenticado
  if (!isAuthenticated) {
    return <Login />;
  }

  const cambiarVista = (nuevaVista: Vista) => {
    setVistaActiva(nuevaVista);
    
    // Cargar datos necesarios según la vista
    if (nuevaVista === 'dashboard') {
      // Dashboard necesita AMBOS: campanas y historico
      obtenerCampanas();
      obtenerHistorico();
    } else if (nuevaVista === 'campanas') {
      // Campanas necesita campanas activas Y histórico para mostrar gráficos
      obtenerCampanas();
      obtenerHistorico();
    } else if (nuevaVista === 'historico') {
      // Histórico solo necesita histórico
      obtenerHistorico();
    }
  };

  const renderizarVista = () => {
    switch (vistaActiva) {
      case 'dashboard':
        return <Dashboard />;
      case 'campanas':
        return (
          <ListaCampanas
            onCrearNueva={() => setMostrarFormularioCrear(true)}
            onEditarMetricasTrafficker={(campana) => setCampanaParaTrafficker(campana)}
            onEditarMetricasDueno={(campana) => setCampanaParaDueno(campana)}
          />
        );
      case 'historico':
        return <ListaCampanasArchivadas />;
      case 'auditoria':
        return <HistorialCambios />;
      case 'administracion':
        return <GestionUsuarios />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {/* Sistema de notificaciones moderno */}
      <Toaster />
      
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-md">
          <ApiErrorAlert error={error} onClose={clearError} />
        </div>
      )}
      
      <Layout
        vistaActiva={vistaActiva}
        onCambiarVista={(vista) => cambiarVista(vista as Vista)}
        onCrearNueva={() => setMostrarFormularioCrear(true)}
        onImportarCampanas={() => setMostrarImportacion(true)}
        onVerHistorico={() => setMostrarHistorico(true)}
        onAbrirDashboard={() => {}}
      >
        {renderizarVista()}
      </Layout>

      {mostrarFormularioCrear && (
        <FormularioCrearCampana onCerrar={() => setMostrarFormularioCrear(false)} />
      )}

      {campanaParaTrafficker && (
        <FormularioMetricasTrafficker
          campana={campanaParaTrafficker}
          onCerrar={() => setCampanaParaTrafficker(null)}
        />
      )}

      {campanaParaDueno && (
        <FormularioMetricasDueno
          campana={campanaParaDueno}
          onCerrar={() => setCampanaParaDueno(null)}
        />
      )}

      {mostrarHistorico && (
        <VistaHistorico onCerrar={() => setMostrarHistorico(false)} />
      )}

      {mostrarImportacion && (
        <ImportarCampanas onCerrar={() => setMostrarImportacion(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AuthProvider>
  );
}

