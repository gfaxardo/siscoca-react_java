import { useState, useEffect } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import FiltrosCampanas from './FiltrosCampanas';
import UploadCreativo from './UploadCreativo';

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
  const { campanas, cambiarEstadoCampana, eliminarCampana, subirCreativo, descargarCreativo, archivarCampana } = useCampanaStore();
  const [campanasFiltradas, setCampanasFiltradas] = useState<Campana[]>(campanas);
  const [campanaParaUpload, setCampanaParaUpload] = useState<Campana | null>(null);

  const campanasActivas = campanasFiltradas.filter(c => c.estado !== 'Archivada');

  const manejarFiltros = (nuevasCampanasFiltradas: Campana[]) => {
    setCampanasFiltradas(nuevasCampanasFiltradas);
  };

  const manejarActivacion = async (campana: Campana) => {
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
  };

  const manejarDescargaCreativo = (campana: Campana) => {
    const resultado = descargarCreativo(campana);
    if (!resultado.exito) {
      alert(resultado.mensaje);
    }
  };

  const manejarArchivado = async (campana: Campana) => {
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
  };

  // Actualizar campañas filtradas cuando cambien las originales
  useEffect(() => {
    setCampanasFiltradas(campanas.filter(c => c.estado !== 'Archivada'));
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
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${obtenerColorEstado(campana.estado)}`}>
                    {campana.estado === 'Creativo Enviado' ? 'Creativo Enviado!' : campana.estado}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-semibold mr-2">Segmento:</span>
                    <span>{campana.segmento}</span>
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {campana.objetivo}
                  </div>
                </div>

                {campana.costoSemanal && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Alcance</p>
                        <p className="font-semibold text-gray-900">
                          {campana.alcance?.toLocaleString() || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Leads</p>
                        <p className="font-semibold text-gray-900">
                          {campana.leads?.toLocaleString() || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Costo Semanal</p>
                        <p className="font-semibold text-gray-900">
                          S/ {campana.costoSemanal?.toFixed(2) || '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Conductores</p>
                        <p className="font-semibold text-gray-900">
                          {campana.conductoresRegistrados || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-4">
                  Actualizado: {format(campana.ultimaActualizacion, "dd/MM/yyyy HH:mm", { locale: es })}
                </div>

                <div className="space-y-2">
                  {/* Botones principales por estado */}
                  <div className="flex flex-wrap gap-2">
                    {campana.estado === 'Pendiente' && (
                      <button
                        onClick={() => setCampanaParaUpload(campana)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        📎 Enviar Creativo
                      </button>
                    )}
                    
                    {campana.estado === 'Creativo Enviado' && (
                      <button
                        onClick={() => manejarActivacion(campana)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        ✅ Activar Campaña
                      </button>
                    )}
                    
                    {campana.estado === 'Activa' && (
                      <>
                        <button
                          onClick={() => onEditarMetricasTrafficker(campana)}
                          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          📊 Subir Métricas Trafficker
                        </button>
                        <button
                          onClick={() => onEditarMetricasDueno(campana)}
                          className="flex-1 bg-warning-500 hover:bg-warning-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                          👥 Subir Métricas Dueño Campaña
                        </button>
                      </>
                    )}

                    {campana.estado === 'Activa' && campana.alcance && campana.conductoresRegistrados !== undefined && (
                      <button
                        onClick={() => manejarArchivado(campana)}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        📁 Archivar Campaña
                      </button>
                    )}
                  </div>

                  {/* Botones secundarios */}
                  <div className="flex flex-wrap gap-2">
                    {campana.estado === 'Creativo Enviado' && campana.archivoCreativo && (
                      <button
                        onClick={() => manejarDescargaCreativo(campana)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-1"
                      >
                        <span>⬇️</span>
                        <span>Descargar Creativo</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar campaña ${campana.nombre}?\n\nEsta acción no se puede deshacer.`)) {
                          eliminarCampana(campana.id);
                        }
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
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

    </div>
  );
}

