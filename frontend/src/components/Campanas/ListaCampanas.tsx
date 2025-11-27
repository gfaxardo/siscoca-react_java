import { useState, useEffect, useMemo } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { Campana, TIPOS_ATERRIZAJE_LABELS, PAISES_LABELS, VERTICALES_LABELS, PLATAFORMAS_LABELS } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import FiltrosCampanas from './FiltrosCampanas';
import UploadCreativo from './UploadCreativo';
import VistaDetalladaCampana from './VistaDetalladaCampana';
import MenuAccionesCampana from './MenuAccionesCampana';
import GraficosBarrasAvanzados from './GraficosBarrasAvanzados';
import MetricasGlobalesComponent from './MetricasGlobales';
import HistorialCambios from './HistorialCambios';
import FormularioEditarCampana from './FormularioEditarCampana';
import ChatCampana from '../Chat/ChatCampana';
import { chatService } from '../../services/chatService';
import { useMenuActions } from '../../store/useMenuActions';
import { AlertTriangle, Plus, MessageCircle, Target, User, Link2, BarChart3, DollarSign, FileText, Car, TrendingUp, Calendar, MapPin, Globe, Smartphone } from 'lucide-react';

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
    descargarCreativo, 
    archivarCampana,
    obtenerHistoricoSemanalCampana
  } = useCampanaStore();
  
  const [campanasFiltradas, setCampanasFiltradas] = useState<Campana[]>([]);
  const [campanaParaUpload, setCampanaParaUpload] = useState<Campana | null>(null);
  const [campanaParaEditar, setCampanaParaEditar] = useState<Campana | null>(null);
  const [modoLecturaEdicion, setModoLecturaEdicion] = useState<boolean>(false);
  const [campanaParaMetricas, setCampanaParaMetricas] = useState<Campana | null>(null);
  const [mostrarMetricasGlobales, setMostrarMetricasGlobales] = useState(false);
  const [campanaParaHistorial, setCampanaParaHistorial] = useState<Campana | null>(null);
  const [mostrarHistorialCambios, setMostrarHistorialCambios] = useState(false);
  const [campanaParaChat, setCampanaParaChat] = useState<Campana | null>(null);
  const [mostrarChat, setMostrarChat] = useState(false);
  const [mensajesNoLeidosPorCampana, setMensajesNoLeidosPorCampana] = useState<Map<string, number>>(new Map());
  const { setAcciones } = useMenuActions();
  const [ordenamiento, setOrdenamiento] = useState<'nueva-antigua' | 'antigua-nueva' | 'costosa-menos' | 'menos-costosa' | 'eficiente-menos' | 'menos-eficiente'>('nueva-antigua');
  const [campanaParaDetalle, setCampanaParaDetalle] = useState<Campana | null>(null);
  const [mostrarVistaDetallada, setMostrarVistaDetallada] = useState(false);
  type EstadoFiltro = 'Todas' | Campana['estado'];
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<EstadoFiltro>('Todas');

  const ESTADOS_FILTRO: Array<{ valor: EstadoFiltro; label: string; descripcion: string }> = [
    { valor: 'Todas', label: 'Todas', descripcion: 'Campañas en curso (excluye archivadas)' },
    { valor: 'Pendiente', label: 'Pendientes', descripcion: 'Campañas esperando creativos o activación' },
    { valor: 'Creativo Enviado', label: 'Creativo enviado', descripcion: 'Creativo listo para activar' },
    { valor: 'Activa', label: 'Activas', descripcion: 'Campañas activas con métricas en curso' },
    { valor: 'Archivada', label: 'Archivadas', descripcion: 'Campañas cerradas y enviadas al histórico' }
  ];

  const clasesBotonEstado: Record<EstadoFiltro, { activo: string; inactivo: string }> = {
    Todas: {
      activo: 'bg-primary-600 border-primary-600 text-white focus:ring-primary-400',
      inactivo: 'bg-white border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600 focus:ring-primary-200'
    },
    Pendiente: {
      activo: 'bg-yellow-500 border-yellow-600 text-white focus:ring-yellow-400',
      inactivo: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:border-yellow-400 focus:ring-yellow-200'
    },
    'Creativo Enviado': {
      activo: 'bg-blue-500 border-blue-600 text-white focus:ring-primary-400',
      inactivo: 'bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400 focus:ring-primary-200'
    },
    Activa: {
      activo: 'bg-green-500 border-green-600 text-white focus:ring-green-400',
      inactivo: 'bg-green-50 border-green-200 text-green-700 hover:border-green-400 focus:ring-green-200'
    },
    Archivada: {
      activo: 'bg-gray-600 border-gray-700 text-white focus:ring-gray-400',
      inactivo: 'bg-gray-100 border-gray-300 text-gray-700 hover:border-gray-400 focus:ring-gray-300'
    }
  };

  const leyendaEstadoSeleccionado: Record<EstadoFiltro, string> = {
    Todas: 'en gestión',
    Pendiente: 'pendientes',
    'Creativo Enviado': 'con creativo enviado',
    Activa: 'activas',
    Archivada: 'archivadas'
  };

  const obtenerClasesBotonEstado = (estado: EstadoFiltro, estaActivo: boolean, deshabilitado = false) => {
    const base = 'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed';
    const estilos = clasesBotonEstado[estado];
    if (deshabilitado && !estaActivo) {
      return `${base} ${estilos.inactivo} opacity-60`;
    }
    return `${base} ${estaActivo ? estilos.activo + ' shadow-md scale-[1.02]' : estilos.inactivo}`;
  };

  const obtenerClasesBadgeConteo = (estaActivo: boolean) =>
    estaActivo
      ? 'px-2 py-0.5 rounded-full text-[11px] leading-none border border-white/50 bg-white/20 text-white'
      : 'px-2 py-0.5 rounded-full text-[11px] leading-none border bg-white/80 text-gray-700';

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

  // Funciones para manejar chat
  const handleAbrirChat = (campana: Campana) => {
    setCampanaParaChat(campana);
    setMostrarChat(true);
  };

  const handleCerrarChat = () => {
    setMostrarChat(false);
    setCampanaParaChat(null);
  };

  // Función para exportar métricas a Excel
  const exportarAExcel = () => {
    try {
      // Preparar datos para exportación
      const datosExportacion = campanasActivas.map(campana => ({
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
      XLSX.utils.book_append_sheet(wb, ws, 'Campañas Activas');

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
      const nombreArchivo = `metricas_campanas_${fecha}.xlsx`;

      // Descargar archivo
      XLSX.writeFile(wb, nombreArchivo);
      
      alert(`✅ Métricas exportadas exitosamente: ${nombreArchivo}`);
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      alert('❌ Error al exportar métricas a Excel');
    }
  };

  // Función para ordenar campañas según el criterio seleccionado
  const ordenarCampanas = (campanasLista: Campana[], criterio: typeof ordenamiento): Campana[] => {
    const campanasCopia = [...campanasLista];
    
    switch (criterio) {
      case 'nueva-antigua':
        return campanasCopia.sort((a, b) => {
          const fechaA = new Date(a.fechaCreacion).getTime();
          const fechaB = new Date(b.fechaCreacion).getTime();
          return fechaB - fechaA;
        });
      
      case 'antigua-nueva':
        return campanasCopia.sort((a, b) => {
          const fechaA = new Date(a.fechaCreacion).getTime();
          const fechaB = new Date(b.fechaCreacion).getTime();
          return fechaA - fechaB;
        });
      
      case 'costosa-menos':
        return campanasCopia.sort((a, b) => {
          const costoA = a.costoSemanal || 0;
          const costoB = b.costoSemanal || 0;
          return costoB - costoA;
        });
      
      case 'menos-costosa':
        return campanasCopia.sort((a, b) => {
          const costoA = a.costoSemanal || 0;
          const costoB = b.costoSemanal || 0;
          return costoA - costoB;
        });
      
      case 'eficiente-menos':
        return campanasCopia.sort((a, b) => {
          // Eficiencia basada en costo por lead o costo por conductor (menor es mejor)
          const eficienciaA = a.costoLead || a.costoConductor || Infinity;
          const eficienciaB = b.costoLead || b.costoConductor || Infinity;
          return eficienciaA - eficienciaB;
        });
      
      case 'menos-eficiente':
        return campanasCopia.sort((a, b) => {
          // Eficiencia basada en costo por lead o costo por conductor (menor es mejor)
          const eficienciaA = a.costoLead || a.costoConductor || Infinity;
          const eficienciaB = b.costoLead || b.costoConductor || Infinity;
          return eficienciaB - eficienciaA;
        });
      
      default:
        return campanasCopia;
    }
  };

  // Las campañas ya vienen ordenadas del useEffect, solo aplicar filtros adicionales si es necesario
  // Usar useMemo para evitar recalcular en cada render y prevenir bucles infinitos
  type ConteoEstados = Record<EstadoFiltro, number>;

  const conteoEstados = useMemo<ConteoEstados>(() => {
    const base: ConteoEstados = {
      Todas: 0,
      Pendiente: 0,
      'Creativo Enviado': 0,
      Activa: 0,
      Archivada: 0
    };

    for (const campana of campanasFiltradas) {
      base[campana.estado] = (base[campana.estado] ?? 0) + 1;
      if (campana.estado !== 'Archivada') {
        base.Todas += 1;
      }
    }

    return base;
  }, [campanasFiltradas]);

  const campanasFiltradasPorEstado = useMemo(() => {
    if (estadoSeleccionado === 'Todas') {
      return campanasFiltradas.filter(c => c.estado !== 'Archivada');
    }
    return campanasFiltradas.filter(c => c.estado === estadoSeleccionado);
  }, [campanasFiltradas, estadoSeleccionado]);

  const campanasActivas = useMemo(() => {
    return ordenarCampanas(campanasFiltradasPorEstado, ordenamiento);
  }, [campanasFiltradasPorEstado, ordenamiento]);

  // Inicializar campañas filtradas y manejar errores
  useEffect(() => {
    try {
      setCampanasFiltradas(campanas);
      setError(null);
    } catch (err) {
      console.error('Error inicializando campañas:', err);
      setError(err instanceof Error ? err.message : 'Error cargando campañas');
    }
  }, [campanas]);

  // Cargar mensajes no leídos por campaña
  useEffect(() => {
    // Solo ejecutar si hay campañas activas
    if (campanasActivas.length === 0) {
      setMensajesNoLeidosPorCampana(new Map());
      return;
    }

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const cargarMensajesNoLeidos = async () => {
      // Evitar ejecuciones simultáneas
      if (!isMounted) return;
      
      try {
        // Usar el nuevo endpoint optimizado que obtiene todos los conteos en una sola consulta
        const conteos = await chatService.getMensajesNoLeidosPorTodasLasCampanas();
        const mapa = new Map<string, number>();
        
        // Convertir el objeto a Map, filtrando solo campañas con mensajes no leídos
        for (const [campanaId, count] of Object.entries(conteos)) {
          if (isMounted && count > 0) {
            mapa.set(campanaId, count);
          }
        }
        
        if (isMounted) {
          setMensajesNoLeidosPorCampana(mapa);
        }
      } catch (err) {
        console.error('Error cargando mensajes no leídos:', err);
      }
    };

    // Cargar inmediatamente solo la primera vez
    cargarMensajesNoLeidos();
    
    // Configurar polling con intervalo más largo (60 segundos en lugar de 30)
    intervalId = setInterval(() => {
      if (isMounted) {
        cargarMensajesNoLeidos();
      }
    }, 60000); // 60 segundos = 1 minuto

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [campanasActivas.length]); // Solo depender de la cantidad, no del array completo

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
          alert(`✅ ${resultado.mensaje}\n\n📌 La campaña ahora está archivada.\nPuedes verla en el menú "Histórico" → "Ver Histórico"`);
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
      setCampanasFiltradas(campanas);
    } catch (err) {
      console.error('Error actualizando campañas filtradas:', err);
      setError('Error actualizando campañas');
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
      },
      {
        id: 'nueva-campana',
        label: 'Nueva Campaña',
        icono: '📝',
        onClick: onCrearNueva,
        color: 'Azul',
        peligroso: false
      }
    ]);
  }, [setAcciones]);

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
      <div className="space-y-4 lg:space-y-6">
        {/* Header moderno con estadísticas */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
                >
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    Gestión de Campañas
                  </h1>
                  <p className="text-gray-400 text-sm">
                    {campanasActivas.length} campaña{campanasActivas.length !== 1 ? 's' : ''} {leyendaEstadoSeleccionado[estadoSeleccionado]}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onCrearNueva}
              className="text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap transform hover:-translate-y-0.5 hover:scale-105"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              <Plus className="w-5 h-5" />
              Nueva Campaña
            </button>
          </div>
        </div>

        {/* Selector de Ordenamiento */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-xl shadow border border-gray-200 p-4 lg:p-5">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-2 whitespace-nowrap">
            <BarChart3 className="w-5 h-5" style={{ color: '#ef0000' }} />
            Ordenar por:
          </label>
          <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value as typeof ordenamiento)}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm font-medium bg-white hover:border-gray-400"
          >
            <option value="nueva-antigua">Más nueva a más antigua</option>
            <option value="antigua-nueva">Más antigua a más nueva</option>
            <option value="costosa-menos">Más costosa a menos costosa</option>
            <option value="menos-costosa">Menos costosa a más costosa</option>
            <option value="eficiente-menos">Más eficiente a menos eficiente</option>
            <option value="menos-eficiente">Menos eficiente a más eficiente</option>
          </select>
        </div>

        {/* Filtro rápido por estado */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-base font-bold text-gray-900">Filtrar por estado</p>
              <p className="text-sm text-gray-500">Visualiza rápidamente campañas según su etapa</p>
            </div>
            <div className="text-sm text-gray-600">
              <span className="hidden sm:inline">Mostrando:&nbsp;</span>
              <span className="font-bold text-gray-900">
                {leyendaEstadoSeleccionado[estadoSeleccionado]}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {ESTADOS_FILTRO.map(({ valor, label, descripcion }) => {
              const estaActivo = estadoSeleccionado === valor;
              const esDeshabilitado = valor !== 'Todas' && conteoEstados[valor] === 0 && !estaActivo;
              return (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setEstadoSeleccionado(valor)}
                  disabled={esDeshabilitado}
                  className={obtenerClasesBotonEstado(valor, estaActivo, esDeshabilitado)}
                  title={descripcion}
                >
                  <span>{label}</span>
                  <span className={obtenerClasesBadgeConteo(estaActivo)}>
                    {valor === 'Todas' ? conteoEstados.Todas : conteoEstados[valor]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros */}
        <FiltrosCampanas 
          campanas={campanas}
          onFiltrar={manejarFiltros}
        />

      {campanasActivas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 lg:p-16 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
            <Target className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            No hay campañas activas
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Comienza creando tu primera campaña
          </p>
          <button
            onClick={onCrearNueva}
            className="text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 transform hover:scale-105"
            style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
          >
            <Plus className="w-5 h-5" />
            Crear Primera Campaña
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {campanasActivas.map((campana) => (
            <div
              key={campana.id}
              onDoubleClick={() => {
                setCampanaParaDetalle(campana);
                setMostrarVistaDetallada(true);
              }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-gray-300 transition-all duration-200 overflow-hidden cursor-pointer transform hover:-translate-y-1"
              title="Doble clic para ver detalles completos"
            >
              <div className="p-4 lg:p-5">
                {/* Header con título y menú de acciones */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2 break-words">
                      {campana.nombre}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                        #{campana.id}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {campana.inicialesDueno}
                      </span>
                      {campana.idPlataformaExterna && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                          <Link2 className="w-3 h-3" />
                          {campana.idPlataformaExterna}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${obtenerColorEstado(campana.estado)}`}>
                      {campana.estado === 'Creativo Enviado' ? 'Creativo Enviado!' : campana.estado}
                    </span>
                    
                    {/* Botón de chat */}
                    {mensajesNoLeidosPorCampana.get(campana.id) ? (
                      <button
                        onClick={() => handleAbrirChat(campana)}
                        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chat de la campaña"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {mensajesNoLeidosPorCampana.get(campana.id)!}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAbrirChat(campana)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chat de la campaña"
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                    )}
                    
                    {/* Menú de acciones */}
                    <MenuAccionesCampana
                      campana={campana}
                      onEnviarCreativo={() => setCampanaParaUpload(campana)}
                      onActivarCampana={() => manejarActivacion(campana)}
                      onSubirMetricasTrafficker={() => onEditarMetricasTrafficker(campana)}
                      onSubirMetricasDueno={() => onEditarMetricasDueno(campana)}
                      onArchivarCampana={() => manejarArchivado(campana)}
                      onDescargarCreativo={() => manejarDescargaCreativo(campana)}
                      onEditarCampana={() => {
                        setModoLecturaEdicion(false);
                        setCampanaParaEditar(campana);
                      }}
                      onVerDetalles={() => {
                        setModoLecturaEdicion(true);
                        setCampanaParaEditar(campana);
                      }}
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
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 mb-3 border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-3 h-3" style={{ color: '#ef0000' }} />
                    Información Básica
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {/* País */}
                    <div className="flex items-center gap-1 text-gray-700">
                      <Globe className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{PAISES_LABELS[campana.pais] || campana.pais}</span>
                    </div>
                    
                    {/* Segmento */}
                    <div className="flex items-center gap-1 text-gray-700">
                      <Target className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{campana.segmento}</span>
                    </div>
                    
                    {/* Vertical */}
                    <div className="flex items-center gap-1 text-gray-700">
                      <BarChart3 className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{VERTICALES_LABELS[campana.vertical] || campana.vertical}</span>
                    </div>
                    
                    {/* Dueño */}
                    <div className="flex items-center gap-1 text-gray-700">
                      <User className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{campana.nombreDueno}</span>
                    </div>
                    
                    {/* Plataforma */}
                    <div className="flex items-center gap-1 text-gray-700">
                      <Smartphone className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{PLATAFORMAS_LABELS[campana.plataforma] || campana.plataforma}</span>
                    </div>
                    
                    {/* Aterrizaje */}
                    <div className="flex items-center gap-1 text-gray-700">
                      <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-900 truncate font-medium">{TIPOS_ATERRIZAJE_LABELS[campana.tipoAterrizaje]}</span>
                      {campana.urlAterrizaje && (
                        <a 
                          href={campana.urlAterrizaje} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Ver destino de aterrizaje"
                        >
                          <Link2 className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {/* Descripción corta */}
                  <div className="flex items-start gap-1 text-gray-700 pt-2 mt-2 border-t border-gray-300">
                    <FileText className="w-3 h-3 text-gray-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-900 text-xs font-medium leading-relaxed">{campana.descripcionCorta}</span>
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
                        <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                          <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">Error cargando gráficos</p>
                        </div>
                      );
                    }
                  })()}
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
          onCerrar={() => {
            setCampanaParaEditar(null);
            setModoLecturaEdicion(false);
          }}
          modoLectura={modoLecturaEdicion}
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

      {/* Modal de Chat */}
      {mostrarChat && campanaParaChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh]">
            <ChatCampana
              campanaId={campanaParaChat.id}
              campanaNombre={campanaParaChat.nombre}
              onClose={handleCerrarChat}
            />
          </div>
        </div>
      )}

      {/* Modal de Vista Detallada */}
      {mostrarVistaDetallada && campanaParaDetalle && (
        <VistaDetalladaCampana
          campana={campanaParaDetalle}
          onCerrar={() => {
            setMostrarVistaDetallada(false);
            setCampanaParaDetalle(null);
          }}
        />
      )}

    </div>
  );
}

