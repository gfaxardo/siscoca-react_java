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
import ModalEliminarCampana from './ModalEliminarCampana';
import { useMenuActions } from '../../store/useMenuActions';
import { 
  AlertTriangle, 
  Archive, 
  User, 
  Flag, 
  Target, 
  BarChart3, 
  MousePointer, 
  DollarSign, 
  Users, 
  Car,
  Globe,
  Smartphone,
  MapPin,
  Link2,
  FileText,
  Calendar,
  Plus
} from 'lucide-react';

export default function ListaCampanasArchivadas() {
  const [error, setError] = useState<string | null>(null);
  
  const { 
    campanas, 
    historico, 
    eliminarCampana, 
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
  const [campanaParaEliminar, setCampanaParaEliminar] = useState<Campana | null>(null);
  const [eliminandoCampana, setEliminandoCampana] = useState(false);
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

  const handleEliminarCampana = async () => {
    if (!campanaParaEliminar) return;
    
    setEliminandoCampana(true);
    try {
      const resultado = await eliminarCampana(campanaParaEliminar.id);
      if (resultado.exito) {
        setCampanaParaEliminar(null);
        // Opcional: mostrar mensaje de éxito
      } else {
        setError(resultado.mensaje);
      }
    } catch (err) {
      console.error('Error eliminando campaña:', err);
      setError('Error eliminando campaña');
    } finally {
      setEliminandoCampana(false);
    }
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
              <AlertTriangle className="w-6 h-6" />
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
      <div className="space-y-6 w-full min-h-full">
        {/* Header moderno con estadísticas */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
              >
                <Archive className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  Histórico de Campañas
                </h1>
                <p className="text-gray-400 text-sm lg:text-base font-medium">
                  {campanasArchivadas.length} campaña{campanasArchivadas.length !== 1 ? 's' : ''} archivada{campanasArchivadas.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <FiltrosCampanas 
          campanas={campanas.filter(c => c.estado === 'Archivada')}
          onFiltrar={manejarFiltros}
        />

      {campanasArchivadas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-16 text-center">
          <div 
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(to bottom right, #6b7280, #4b5563)' }}
          >
            <Archive className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No hay campañas archivadas
          </h3>
          <p className="text-gray-600 text-base font-medium">
            Las campañas archivadas aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {campanasArchivadas.map((campana) => (
            <div
              key={campana.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-200 overflow-hidden cursor-pointer transform hover:-translate-y-1 flex flex-col"
              style={{ minHeight: '580px' }}
            >
              <div className="p-5 lg:p-6 flex flex-col h-full">
                {/* Header con título y menú de acciones */}
                <div className="mb-4" style={{ minHeight: '110px' }}>
                  {/* Título con botones alineados */}
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="flex-1 text-base lg:text-lg font-bold text-gray-900 line-clamp-2 pr-3" style={{ height: '56px', lineHeight: '28px' }} title={campana.nombre}>
                      {campana.nombre}
                    </h3>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
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
                        onEliminarCampana={() => setCampanaParaEliminar(campana)}
                      />
                    </div>
                  </div>
                  
                  {/* Badges debajo del título */}
                  <div className="flex flex-wrap gap-2 overflow-hidden" style={{ height: '32px' }}>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 h-fit">
                      #{campana.id}
                    </span>
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 h-fit">
                      <User className="w-3 h-3" />
                      {campana.inicialesDueno}
                    </span>
                    {campana.idPlataformaExterna && (
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 h-fit">
                        <Link2 className="w-3 h-3" />
                        {campana.idPlataformaExterna}
                      </span>
                    )}
                  </div>
                </div>

                {/* Información básica de la campaña */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200" style={{ minHeight: '170px' }}>
                  <h4 className="text-xs font-bold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                    <FileText className="w-4 h-4" style={{ color: '#ef0000' }} />
                    Información Básica
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    {/* País */}
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Globe className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{PAISES_LABELS[campana.pais] || campana.pais}</span>
                    </div>
                    
                    {/* Segmento */}
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Target className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{campana.segmento}</span>
                    </div>
                    
                    {/* Vertical */}
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <BarChart3 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{VERTICALES_LABELS[campana.vertical] || campana.vertical}</span>
                    </div>
                    
                    {/* Dueño */}
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <User className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{campana.nombreDueno}</span>
                    </div>
                    
                    {/* Plataforma */}
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Smartphone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{PLATAFORMAS_LABELS[campana.plataforma] || campana.plataforma}</span>
                    </div>
                    
                    {/* Aterrizaje */}
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{TIPOS_ATERRIZAJE_LABELS[campana.tipoAterrizaje]}</span>
                      {campana.urlAterrizaje && (
                        <a 
                          href={campana.urlAterrizaje} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver destino de aterrizaje"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Descripción corta */}
                  <div className="flex items-start gap-1.5 text-gray-700 pt-3 mt-3 border-t border-gray-300">
                    <FileText className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 text-xs font-medium leading-relaxed">{campana.descripcionCorta}</span>
                  </div>
                </div>

                {/* Gráficos de evolución en lugar de métricas estáticas */}
                <div className="flex-1 flex items-end mb-4">
                  <div className="w-full">
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
                          <div className="bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-center" style={{ minHeight: '280px' }}>
                            <div className="text-center p-6">
                              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                              <p className="text-sm text-gray-900 font-bold mb-1">Error cargando gráficos</p>
                              <p className="text-xs text-gray-500">Intenta recargar la página</p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Información de actualización */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span className="font-medium">{format(campana.ultimaActualizacion, "dd/MM/yy HH:mm", { locale: es })}</span>
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

      {/* Modal de Eliminar Campaña */}
      {campanaParaEliminar && (
        <ModalEliminarCampana
          campana={campanaParaEliminar}
          onConfirmar={handleEliminarCampana}
          onCancelar={() => setCampanaParaEliminar(null)}
          isLoading={eliminandoCampana}
        />
      )}

    </div>
  );
}

