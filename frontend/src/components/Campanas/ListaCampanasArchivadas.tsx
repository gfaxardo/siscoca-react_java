import { useState, useEffect } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana, TIPOS_ATERRIZAJE_LABELS, PAISES_LABELS, VERTICALES_LABELS, PLATAFORMAS_LABELS } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import FiltrosCampanas from './FiltrosCampanas';
import UploadCreativo from './UploadCreativo';
import MenuAccionesCampana from './MenuAccionesCampana';
import GraficosBarrasAvanzados from './GraficosBarrasAvanzados';
import MetricasGlobalesComponent from './MetricasGlobales';
import HistorialCambios from './HistorialCambios';
import FormularioEditarCampana from './FormularioEditarCampana';
import { useMenuActions } from '../../store/useMenuActions';

export default function ListaCampanasArchivadas() {
  const [error, setError] = useState<string | null>(null);
  
  const { 
    campanas, 
    historico, 
    eliminarCampana, 
    subirCreativo, 
    descargarCreativo,
    reactivarCampana,
    obtenerHistoricoSemanalCampana,
    obtenerCampanas
  } = useCampanaStore();

  // Cargar campañas cuando se monta el componente
  useEffect(() => {
    obtenerCampanas();
  }, []);
  
  const [campanasFiltradas, setCampanasFiltradas] = useState<Campana[]>([]);
  const [campanaParaUpload, setCampanaParaUpload] = useState<Campana | null>(null);
  const [campanaParaEditar, setCampanaParaEditar] = useState<Campana | null>(null);
  const [campanaParaMetricas, setCampanaParaMetricas] = useState<Campana | null>(null);
  const [mostrarMetricasGlobales, setMostrarMetricasGlobales] = useState(false);
  const [campanaParaHistorial, setCampanaParaHistorial] = useState<Campana | null>(null);
  const [mostrarHistorialCambios, setMostrarHistorialCambios] = useState(false);
  const { setAcciones } = useMenuActions();

  // Funciones para manejar métricas globales
  const handleVerMetricasGlobales = (campana: Campana) => {
    setCampanaParaMetricas(campana);
    setMostrarMetricasGlobales(true);
  };

  const handleCerrarMetricasGlobales = () => {
    setMostrarMetricasGlobales(false);
    setCampanaParaMetricas(null);
  };

  // Funciones para manejar historial de cambios
  const handleVerHistorialCambios = (campana: Campana) => {
    setCampanaParaHistorial(campana);
    setMostrarHistorialCambios(true);
  };

  const handleCerrarHistorialCambios = () => {
    setMostrarHistorialCambios(false);
    setCampanaParaHistorial(null);
  };

  // Función para exportar métricas a Excel
  const exportarAExcel = () => {
    try {
      // Preparar datos para exportación
      const datosExportacion = campanasArchivadas.map(campana => ({
        'ID': campana.id,
        'Nombre': campana.nombre,
        'Estado': campana.estado,
        'País': campana.pais,
        'Vertical': campana.vertical,
        'Plataforma': campana.plataforma,
        'Segmento': campana.segmento,
        'Alcance': campana.alcance || 0,
        'Clics': campana.clics || 0,
        'Leads': campana.leads || 0,
        'Costo Semanal (USD)': campana.costoSemanal || 0,
        'Costo por Lead (USD)': campana.costoLead || 0,
        'Registros': campana.conductoresRegistrados || 0,
        'Conductores (Primer Viaje)': campana.conductoresPrimerViaje || 0,
        'Costo por Conductor (USD)': campana.costoConductor || 0,
        'Fecha Creación': campana.fechaCreacion ? new Date(campana.fechaCreacion).toLocaleDateString('es-ES') : '',
        'Última Actualización': campana.ultimaActualizacion ? new Date(campana.ultimaActualizacion).toLocaleDateString('es-ES') : ''
      }));

      // Crear workbook y worksheet
      const ws = XLSX.utils.json_to_sheet(datosExportacion);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Campañas Archivadas');

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 10 }, // ID
        { wch: 40 }, // Nombre
        { wch: 15 }, // Estado
        { wch: 8 },  // País
        { wch: 12 }, // Vertical
        { wch: 12 }, // Plataforma
        { wch: 12 }, // Segmento
        { wch: 12 }, // Alcance
        { wch: 10 }, // Clics
        { wch: 10 }, // Leads
        { wch: 18 }, // Costo Semanal
        { wch: 18 }, // Costo por Lead
        { wch: 12 }, // Registros
        { wch: 22 }, // Conductores
        { wch: 24 }, // Costo por Conductor
        { wch: 15 }, // Fecha Creación
        { wch: 20 }  // Última Actualización
      ];
      ws['!cols'] = colWidths;

      // Generar nombre del archivo con fecha
      const fecha = new Date().toISOString().split('T')[0];
      const nombreArchivo = `metricas_campanas_archivadas_${fecha}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);
      
      alert(`✅ Métricas exportadas exitosamente: ${nombreArchivo}`);
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('❌ Error al exportar métricas a Excel');
    }
  };

  // Inicializar campañas filtradas y manejar errores
  useEffect(() => {
    try {
      // Filtrar solo campañas archivadas y ordenar por fecha de creación descendente (más recientes primero)
      const campanasOrdenadas = campanas
        .filter(c => c.estado === 'Archivada')
        .sort((a, b) => {
          // Ordenar por fecha de creación descendente (más recientes primero)
          const fechaA = new Date(a.fechaCreacion).getTime();
          const fechaB = new Date(b.fechaCreacion).getTime();
          return fechaB - fechaA;
        });
      setCampanasFiltradas(campanasOrdenadas);
      setError(null);
    } catch (err) {
      console.error('Error inicializando campañas archivadas:', err);
      setError(err instanceof Error ? err.message : 'Error cargando campañas archivadas');
    }
  }, [campanas]);

  // Configurar acciones del menú contextual
  useEffect(() => {
    setAcciones([
      {
        id: 'exportar-excel',
        label: 'Exportar Excel',
        icono: '📊',
        onClick: exportarAExcel,
        color: 'Verde',
        peligroso: false
      }
    ]);
  }, [setAcciones]);

  // Las campañas ya vienen ordenadas del useEffect, solo aplicar filtros adicionales si es necesario
  const campanasArchivadas = campanasFiltradas;

  const manejarFiltros = (nuevasCampanasFiltradas: Campana[]) => {
    try {
      setCampanasFiltradas(nuevasCampanasFiltradas);
    } catch (err) {
      console.error('Error aplicando filtros:', err);
      setError('Error aplicando filtros');
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

  const manejarReactivacion = async (campana: Campana) => {
    try {
      const confirmar = window.confirm(
        `¿Estás seguro de que quieres REACTIVAR esta campaña?\n\n` +
        `Campaña: ${campana.nombre}\n\n` +
        `⚠️ IMPORTANTE:\n` +
        `• Volverá a aparecer en campañas activas\n` +
        `• Podrás seguir subiendo métricas\n\n` +
        `¿Continuar con la reactivación?`
      );
      
      if (confirmar) {
        const resultado = await reactivarCampana(campana);
        if (resultado.exito) {
          alert(`✅ ${resultado.mensaje}\n\n📌 La campaña ahora está activa.\nPuedes verla en el menú "Campañas" → "Campañas Activas"`);
        } else {
          alert(`❌ ${resultado.mensaje}`);
        }
      }
    } catch (err) {
      console.error('Error reactivando campaña:', err);
      setError('Error reactivando campaña');
    }
  };

  // Actualizar campañas filtradas cuando cambien las originales
  useEffect(() => {
    try {
      setCampanasFiltradas(campanas.filter(c => c.estado === 'Archivada'));
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
              <h3 className="text-red-800 font-semibold">Error en Campañas Archivadas</h3>
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
      <div className="space-y-2 lg:space-y-3 w-full min-h-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <p className="text-gray-600 text-xs lg:text-sm">
            {campanasArchivadas.length} campaña{campanasArchivadas.length !== 1 ? 's' : ''} archivada{campanasArchivadas.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtros */}
        <FiltrosCampanas 
          campanas={campanas.filter(c => c.estado === 'Archivada')}
          onFiltrar={manejarFiltros}
        />

      {campanasArchivadas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay campañas archivadas
          </h3>
          <p className="text-gray-500 mb-6">
            Las campañas archivadas aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {campanasArchivadas.map((campana) => (
            <div
              key={campana.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div className="p-3 lg:p-4">
                {/* Header con título y menú de acciones */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm lg:text-base font-bold text-gray-900 mb-1 break-words">
                      {campana.nombre}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">
                        #{campana.id}
                      </span>
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
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
                      {campana.estado}
                    </span>
                    
                    {/* Menú de acciones */}
                    <MenuAccionesCampana
                      campana={campana}
                      onEnviarCreativo={() => setCampanaParaUpload(campana)}
                      onActivarCampana={() => {}}
                      onSubirMetricasTrafficker={() => {}}
                      onSubirMetricasDueno={() => {}}
                      onArchivarCampana={() => {}}
                      onReactivarCampana={() => manejarReactivacion(campana)}
                      onDescargarCreativo={() => manejarDescargaCreativo(campana)}
                      onEditarCampana={() => setCampanaParaEditar(campana)}
                      onVerMetricasGlobales={() => handleVerMetricasGlobales(campana)}
                      onVerHistorialCambios={() => handleVerHistorialCambios(campana)}
                      onEliminarCampana={async () => {
                        try {
                          if (confirm(`¿Eliminar campaña ${campana.nombre}?\n\nEsta acción no se puede deshacer.`)) {
                            const resultado = await eliminarCampana(campana.id);
                            if (!resultado.exito) {
                              setError(resultado.mensaje);
                            }
                          }
                        } catch (err) {
                          console.error('Error eliminando campaña:', err);
                          setError('Error eliminando campaña');
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Información básica de la campaña */}
                <div className="bg-gray-50 rounded-lg p-2 mb-3">
                  <h4 className="text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">Información Básica</h4>
                  
                  <div className="grid grid-cols-3 gap-x-2 gap-y-1 text-xs">
                    {/* País */}
                    <div className="text-gray-700">
                      <span className="text-gray-600">🌍</span>
                      <span className="ml-1 text-gray-900 truncate">{PAISES_LABELS[campana.pais] || campana.pais}</span>
                    </div>
                    
                    {/* Segmento */}
                    <div className="text-gray-700">
                      <span className="text-gray-600">🎯</span>
                      <span className="ml-1 text-gray-900 truncate">{campana.segmento}</span>
                    </div>
                    
                    {/* Vertical */}
                    <div className="text-gray-700">
                      <span className="text-gray-600">📊</span>
                      <span className="ml-1 text-gray-900 truncate">{VERTICALES_LABELS[campana.vertical] || campana.vertical}</span>
                    </div>
                    
                    {/* Dueño */}
                    <div className="text-gray-700">
                      <span className="text-gray-600">👤</span>
                      <span className="ml-1 text-gray-900 truncate">{campana.nombreDueno}</span>
                    </div>
                    
                    {/* Plataforma */}
                    <div className="text-gray-700">
                      <span className="text-gray-600">📱</span>
                      <span className="ml-1 text-gray-900 truncate">{PLATAFORMAS_LABELS[campana.plataforma] || campana.plataforma}</span>
                    </div>
                    
                    {/* Aterrizaje */}
                    <div className="text-gray-700">
                      <span className="text-gray-600">🎯</span>
                      <span className="ml-1 text-gray-900 truncate">{TIPOS_ATERRIZAJE_LABELS[campana.tipoAterrizaje]}</span>
                      {campana.urlAterrizaje && (
                        <a 
                          href={campana.urlAterrizaje} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:text-blue-800"
                          title="Ver destino de aterrizaje"
                        >
                          🔗
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Descripción corta - Ocupa ambas columnas */}
                  <div className="text-gray-700 pt-1.5 mt-1.5 border-t border-gray-200 col-span-3">
                    <span className="text-gray-600">📝</span>
                    <span className="ml-1 text-gray-900 text-xs">{campana.descripcionCorta}</span>
                  </div>
                </div>

                {/* Gráficos de evolución en lugar de métricas estáticas */}
                <div className="mb-2">
                  {(() => {
                    try {
                      return (
                        <GraficosBarrasAvanzados 
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
                <div className="text-xs text-gray-400">
                  {format(campana.ultimaActualizacion, "dd/MM/yy HH:mm", { locale: es })}
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
        />
      )}

      {/* Modal de Edición de Campaña */}
      {campanaParaEditar && (
        <FormularioEditarCampana
          campana={campanaParaEditar}
          onCerrar={() => setCampanaParaEditar(null)}
        />
      )}

      {/* Modal de Métricas Globales */}
      {mostrarMetricasGlobales && campanaParaMetricas && (
        <MetricasGlobalesComponent
          campana={campanaParaMetricas}
          onCerrar={handleCerrarMetricasGlobales}
        />
      )}

      {/* Modal de Historial de Cambios */}
      {mostrarHistorialCambios && campanaParaHistorial && (
        <HistorialCambios
          campana={campanaParaHistorial}
          onCerrar={handleCerrarHistorialCambios}
        />
      )}

    </div>
  );
}

