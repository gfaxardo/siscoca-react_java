import { useState, useEffect } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import FiltrosCampanas from './FiltrosCampanas';
import UploadCreativo from './UploadCreativo';
import MenuAccionesCampana from './MenuAccionesCampana';
import GraficosMetricas from './GraficosMetricas';
import HistoricoSemanasCampana from './HistoricoSemanasCampana';

interface ListaCampanasProps {
  onCrearNueva: () => void;
  onEditarMetricasTrafficker: (campana: Campana) => void;
  onEditarMetricasDueno: (campana: Campana) => void;
}

export default function ListaCampanas({ 
  onCrearNueva, 
  onEditarMetricasTrafficker,
  onEditarMetricasDueno 
}: ListaCampanasProps) {
  const [error, setError] = useState<string | null>(null);
  
  const { 
    campanas, 
    historico, 
    cambiarEstadoCampana, 
    eliminarCampana, 
    subirCreativo, 
    descargarCreativo, 
    archivarCampana,
    guardarHistoricoSemanal,
    obtenerHistoricoSemanalCampana
  } = useCampanaStore();
  
  const [campanasFiltradas, setCampanasFiltradas] = useState<Campana[]>([]);
  const [campanaParaUpload, setCampanaParaUpload] = useState<Campana | null>(null);
  const [campanaParaHistorico, setCampanaParaHistorico] = useState<Campana | null>(null);

  // Inicializar campañas filtradas y manejar errores
  useEffect(() => {
    try {
      setCampanasFiltradas(campanas.filter(c => c.estado !== 'Archivada'));
      setError(null);
    } catch (err) {
      console.error('Error inicializando campañas:', err);
      setError(err instanceof Error ? err.message : 'Error cargando campañas');
    }
  }, [campanas]);

  const campanasActivas = campanasFiltradas.filter(c => c.estado !== 'Archivada');

  const manejarFiltros = (nuevasCampanasFiltradas: Campana[]) => {
    try {
      setCampanasFiltradas(nuevasCampanasFiltradas);
    } catch (err) {
      console.error('Error aplicando filtros:', err);
      setError('Error aplicando filtros');
    }
  };

  const manejarActivacion = async (campana: Campana) => {
    try {
      const confirmar = window.confirm(
        `¿Estás seguro de que quieres ACTIVAR la campaña?\n\n` +
        `Campaña: ${campana.nombre}\n` +
        `Una vez activada, podrás subir métricas.`
      );
      
      if (confirmar) {
        const resultado = await cambiarEstadoCampana(campana.id, 'Activa');
        if (!resultado.exito) {
          alert(resultado.mensaje);
        }
      }
    } catch (err) {
      console.error('Error activando campaña:', err);
      setError('Error activando campaña');
    }
  };

  const manejarDescargaCreativo = (campana: Campana) => {
    try {
      const resultado = descargarCreativo(campana);
      if (!resultado.exito) {
        alert(resultado.mensaje);
      }
    } catch (err) {
      console.error('Error descargando creativo:', err);
      setError('Error descargando creativo');
    }
  };

  const manejarArchivado = async (campana: Campana) => {
    try {
      const confirmar = window.confirm(
        `¿Estás seguro de que quieres ARCHIVAR esta campaña?\n\n` +
        `Campaña: ${campana.nombre}\n\n` +
        `⚠️ IMPORTANTE:\n` +
        `• Se moverá al histórico semanal\n` +
        `• Ya no aparecerá en campañas activas\n` +
        `• Esta acción no se puede deshacer\n\n` +
        `¿Continuar con el archivado?`
      );
      
      if (confirmar) {
        const resultado = await archivarCampana(campana);
        if (resultado.exito) {
          alert(`✅ ${resultado.mensaje}`);
        } else {
          alert(`❌ ${resultado.mensaje}`);
        }
      }
    } catch (err) {
      console.error('Error archivando campaña:', err);
      setError('Error archivando campaña');
    }
  };

  // Actualizar campañas filtradas cuando cambien las originales
  useEffect(() => {
    try {
      setCampanasFiltradas(campanas.filter(c => c.estado !== 'Archivada'));
    } catch (err) {
      console.error('Error actualizando campañas filtradas:', err);
      setError('Error actualizando campañas');
    }
  }, [campanas]);

  const obtenerColorEstado = (estado: Campana['estado']) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Creativo Enviado':
        return 'bg-blue-100 text-blue-800';
      case 'Activa':
        return 'bg-green-100 text-green-800';
      case 'Archivada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  // Mostrar error si existe
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-800 font-semibold">Error en Campañas</h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button 
                onClick={() => setError(null)}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Campañas Activas</h2>
            <p className="text-gray-600 mt-1">
              {campanasActivas.length} campaña{campanasActivas.length !== 1 ? 's' : ''} en gestión
            </p>
          </div>
          <button
            onClick={onCrearNueva}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 shadow-lg"
          >
            <span>📝</span>
            <span>Nueva Campaña</span>
          </button>
        </div>

        {/* Filtros */}
        <FiltrosCampanas 
          campanas={campanas.filter(c => c.estado !== 'Archivada')}
          onFiltrar={manejarFiltros}
        />

      {campanasActivas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay campañas activas
          </h3>
          <p className="text-gray-500 mb-6">
            Comienza creando tu primera campaña
          </p>
          <button
            onClick={onCrearNueva}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Crear Primera Campaña
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {campanasActivas.map((campana) => (
            <div
              key={campana.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Header con título y menú de acciones */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-gray-900 mb-2 break-words">
                      {campana.nombre}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                        #{campana.id}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                        👤 {campana.inicialesDueno}
                      </span>
                      {campana.idPlataformaExterna && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                          🔗 {campana.idPlataformaExterna}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${obtenerColorEstado(campana.estado)}`}>
                      {campana.estado === 'Creativo Enviado' ? 'Creativo Enviado!' : campana.estado}
                    </span>
                    
                    {/* Menú de acciones */}
                    <MenuAccionesCampana
                      campana={campana}
                      onEnviarCreativo={() => setCampanaParaUpload(campana)}
                      onActivarCampana={() => manejarActivacion(campana)}
                      onSubirMetricasTrafficker={() => onEditarMetricasTrafficker(campana)}
                      onSubirMetricasDueno={() => onEditarMetricasDueno(campana)}
                      onArchivarCampana={() => manejarArchivado(campana)}
                      onDescargarCreativo={() => manejarDescargaCreativo(campana)}
                      onHistoricoSemanas={() => setCampanaParaHistorico(campana)}
                      onEliminarCampana={() => {
                        try {
                          if (confirm(`¿Eliminar campaña ${campana.nombre}?\n\nEsta acción no se puede deshacer.`)) {
                            eliminarCampana(campana.id);
                          }
                        } catch (err) {
                          console.error('Error eliminando campaña:', err);
                          setError('Error eliminando campaña');
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Información básica */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-semibold mr-2">Segmento:</span>
                    <span>{campana.segmento}</span>
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {campana.objetivo}
                  </div>
                </div>

                {/* Gráficos de evolución en lugar de métricas estáticas */}
                <div className="mb-4">
                  {(() => {
                    try {
                      return (
                        <GraficosMetricas 
                          campana={campana} 
                          historico={historico}
                          historicoSemanas={obtenerHistoricoSemanalCampana(campana.id)}
                        />
                      );
                    } catch (err) {
                      console.error('Error renderizando gráficos:', err);
                      return (
                        <div className="bg-gray-50 rounded-lg p-4 text-center">
                          <div className="text-2xl mb-2">📊</div>
                          <p className="text-sm text-gray-500">Error cargando gráficos</p>
                        </div>
                      );
                    }
                  })()}
                </div>

                {/* Información de actualización */}
                <div className="text-xs text-gray-500">
                  Actualizado: {format(campana.ultimaActualizacion, "dd/MM/yyyy HH:mm", { locale: es })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Upload de Creativo */}
      {campanaParaUpload && (
        <UploadCreativo
          campana={campanaParaUpload}
          onCerrar={() => setCampanaParaUpload(null)}
          onSubirCreativo={subirCreativo}
        />
      )}

      {/* Modal de Histórico de Semanas */}
      {campanaParaHistorico && (
        <HistoricoSemanasCampana
          campana={campanaParaHistorico}
          onCerrar={() => setCampanaParaHistorico(null)}
          onGuardarHistorico={guardarHistoricoSemanal}
          historicoExistente={obtenerHistoricoSemanalCampana(campanaParaHistorico.id)}
        />
      )}

    </div>
  );
}

