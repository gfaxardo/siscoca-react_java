import { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import ListaCampanas from './components/Campanas/ListaCampanas';
import VistaHistorico from './components/Historico/VistaHistorico';
import FormularioCrearCampana from './components/Campanas/FormularioCrearCampana';
import FormularioMetricasTrafficker from './components/Campanas/FormularioMetricasTrafficker';
import FormularioMetricasDueno from './components/Campanas/FormularioMetricasDueno';
import ImportarCampanas from './components/Campanas/ImportarCampanas';
import { useCampanaStore } from './store/useCampanaStore';
import { Campana } from './types';
// import { cargarDatosEjemplo } from './utils/datosEjemplo';

type Vista = 'dashboard' | 'campanas' | 'historico';

export default function App() {
  const [vistaActiva, setVistaActiva] = useState<Vista>('dashboard');
  const [mostrarFormularioCrear, setMostrarFormularioCrear] = useState(false);
  const [campanaParaTrafficker, setCampanaParaTrafficker] = useState<Campana | null>(null);
  const [campanaParaDueno, setCampanaParaDueno] = useState<Campana | null>(null);
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const [mostrarImportacion, setMostrarImportacion] = useState(false);
  
  const { obtenerCampanas, obtenerHistorico } = useCampanaStore();

  useEffect(() => {
    // No cargar datos de ejemplo automáticamente para empezar limpio
    // cargarDatosEjemplo();
    obtenerCampanas();
    obtenerHistorico();
  }, [obtenerCampanas, obtenerHistorico]);

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
        return (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Histórico Semanal
            </h3>
            <p className="text-gray-500 mb-6">
              Visualiza todas las campañas archivadas por semana
            </p>
            <button
              onClick={() => setMostrarHistorico(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Histórico Completo
            </button>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout
        vistaActiva={vistaActiva}
        onCambiarVista={(vista) => setVistaActiva(vista as Vista)}
        onCrearNueva={() => setMostrarFormularioCrear(true)}
        onImportarCampanas={() => setMostrarImportacion(true)}
        onVerHistorico={() => setMostrarHistorico(true)}
      >
        <div className="mb-6">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setVistaActiva('dashboard')}
              className={`px-6 py-3 font-semibold transition-colors ${
                vistaActiva === 'dashboard'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setVistaActiva('campanas')}
              className={`px-6 py-3 font-semibold transition-colors ${
                vistaActiva === 'campanas'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎯 Campañas
            </button>
            <button
              onClick={() => setVistaActiva('historico')}
              className={`px-6 py-3 font-semibold transition-colors ${
                vistaActiva === 'historico'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📈 Histórico
            </button>
          </div>
        </div>

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

