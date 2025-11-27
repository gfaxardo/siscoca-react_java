import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Campana, TareaPendiente } from '../../types';
import { useCampanaStore, HistoricoSemanalCampana } from '../../store/useCampanaStore';
import { getISOWeek } from 'date-fns';
import { PAISES_LABELS, VERTICALES_LABELS, PLATAFORMAS_LABELS, TIPOS_ATERRIZAJE_LABELS } from '../../types';
import { tareaService } from '../../services/tareaService';
import { 
  Eye, 
  X, 
  Info, 
  Globe, 
  Target as TargetIcon, 
  Flag, 
  Users, 
  Calendar, 
  MapPin, 
  FileText, 
  Link2,
  BarChart3,
  MousePointer,
  DollarSign,
  Car,
  UserPlus,
  Loader2,
  PlusCircle,
  Archive as ArchiveIcon,
  CheckCircle,
  Paperclip
} from 'lucide-react';

interface VistaDetalladaCampanaProps {
  campana: Campana;
  onCerrar: () => void;
}

export default function VistaDetalladaCampana({ campana, onCerrar }: VistaDetalladaCampanaProps) {
  const { obtenerHistoricoSemanalCampana } = useCampanaStore();
  const [historico, setHistorico] = useState<HistoricoSemanalCampana[]>([]);
  const [semanasSeleccionadas, setSemanasSeleccionadas] = useState<number[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tareasCompletadas, setTareasCompletadas] = useState<TareaPendiente[]>([]);
  const [cargandoTareas, setCargandoTareas] = useState(false);
  const [selectorSemanasAbierto, setSelectorSemanasAbierto] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarHistorico();
    cargarTareasCompletadas();
  }, [campana.id]);

  const cargarHistorico = () => {
    try {
      const historicoData = obtenerHistoricoSemanalCampana(campana.id);
      setHistorico(historicoData);
      
      // Seleccionar la semana más reciente por defecto
      if (historicoData.length > 0) {
        const semanasOrdenadas = [...historicoData].sort((a, b) => b.semanaISO - a.semanaISO);
        setSemanasSeleccionadas([semanasOrdenadas[0].semanaISO]);
      } else {
        // Si no hay histórico, usar la semana actual
        setSemanasSeleccionadas([getISOWeek(new Date())]);
      }
      setCargando(false);
    } catch (error) {
      console.error('Error cargando histórico:', error);
      setCargando(false);
    }
  };

  const obtenerSemanaActual = () => {
    return getISOWeek(new Date());
  };

  const cargarTareasCompletadas = async () => {
    try {
      setCargandoTareas(true);
      const tareas = await tareaService.getTareasCompletadasPorCampana(campana.id);
      // Ordenar por fecha de completado descendente (más recientes primero)
      const tareasOrdenadas = tareas.sort((a, b) => {
        if (!a.fechaCompletada && !b.fechaCompletada) return 0;
        if (!a.fechaCompletada) return 1;
        if (!b.fechaCompletada) return -1;
        return b.fechaCompletada.getTime() - a.fechaCompletada.getTime();
      });
      setTareasCompletadas(tareasOrdenadas);
    } catch (error) {
      console.error('Error cargando tareas completadas:', error);
    } finally {
      setCargandoTareas(false);
    }
  };

  const getIconoTarea = (tipo: string) => {
    switch (tipo) {
      case 'Crear Campaña':
        return <PlusCircle className="w-5 h-5" />;
      case 'Enviar Creativo':
        return <Paperclip className="w-5 h-5" />;
      case 'Activar Campaña':
        return <CheckCircle className="w-5 h-5" />;
      case 'Subir Métricas Trafficker':
        return <BarChart3 className="w-5 h-5" />;
      case 'Subir Métricas Dueño':
        return <Users className="w-5 h-5" />;
      case 'Archivar Campaña':
        return <ArchiveIcon className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    if (!selectorSemanasAbierto) return;
    function handleClickOutside(event: MouseEvent) {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setSelectorSemanasAbierto(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectorSemanasAbierto]);

  const semanasDisponibles = useMemo(() => {
    const semanasHistorico = historico.length > 0
      ? [...new Set(historico.map(h => h.semanaISO))]
      : [];
    const actual = obtenerSemanaActual();
    if (!semanasHistorico.includes(actual)) {
      semanasHistorico.push(actual);
    }
    return semanasHistorico.sort((a, b) => b - a);
  }, [historico]);

  const datosSemanasSeleccionadas = useMemo(() => {
    if (semanasSeleccionadas.length === 0) {
      return [];
    }
    const datosHistoricos = historico.filter(h => semanasSeleccionadas.includes(h.semanaISO));
    const semanaActual = obtenerSemanaActual();
    const incluyeActual = semanasSeleccionadas.includes(semanaActual);
    const yaIncluyeActual = datosHistoricos.some(h => h.semanaISO === semanaActual);

    if (incluyeActual && !yaIncluyeActual) {
      datosHistoricos.push({
        id: `${campana.id}-${semanaActual}-actual`,
        idCampana: campana.id,
        semanaISO: semanaActual,
        fechaSemana: new Date(),
        alcance: campana.alcance,
        clics: campana.clics,
        leads: campana.leads,
        costoSemanal: campana.costoSemanal,
        costoLead: campana.costoLead,
        conductoresRegistrados: campana.conductoresRegistrados,
        conductoresPrimerViaje: campana.conductoresPrimerViaje,
        costoConductorRegistrado: campana.costoConductorRegistrado,
        costoConductorPrimerViaje: campana.costoConductorPrimerViaje,
        urlInforme: campana.urlInforme,
        fechaRegistro: new Date(),
        registradoPor: 'Actual'
      } as HistoricoSemanalCampana);
    }
    return datosHistoricos.sort((a, b) => b.semanaISO - a.semanaISO);
  }, [campana, historico, semanasSeleccionadas]);

  const resumenTrafficker = useMemo(() => {
    if (datosSemanasSeleccionadas.length === 0) return null;
    const totalAlcance = datosSemanasSeleccionadas.reduce((acc, h) => acc + (h.alcance || 0), 0);
    const totalClics = datosSemanasSeleccionadas.reduce((acc, h) => acc + (h.clics || 0), 0);
    const totalLeads = datosSemanasSeleccionadas.reduce((acc, h) => acc + (h.leads || 0), 0);
    const totalCostoSemanal = datosSemanasSeleccionadas.reduce((acc, h) => acc + (h.costoSemanal || 0), 0);
    const costoLeadPromedio = totalLeads > 0 ? totalCostoSemanal / totalLeads : null;
    return {
      alcance: totalAlcance,
      clics: totalClics,
      leads: totalLeads,
      costoSemanal: totalCostoSemanal,
      costoLeadPromedio
    };
  }, [datosSemanasSeleccionadas]);

  const resumenDueno = useMemo(() => {
    if (datosSemanasSeleccionadas.length === 0) return null;
    const totalRegistrados = datosSemanasSeleccionadas.reduce((acc, h) => acc + (h.conductoresRegistrados || 0), 0);
    const totalPrimerViaje = datosSemanasSeleccionadas.reduce((acc, h) => acc + (h.conductoresPrimerViaje || 0), 0);
    const totalCostoRegistrado = datosSemanasSeleccionadas.reduce((acc, h) => acc + (h.costoConductorRegistrado || 0), 0);
    const totalCostoPrimerViaje = datosSemanasSeleccionadas.reduce((acc, h) => acc + (h.costoConductorPrimerViaje || 0), 0);
    return {
      conductoresRegistrados: totalRegistrados,
      conductoresPrimerViaje: totalPrimerViaje,
      costoConductorRegistrado: totalCostoRegistrado,
      costoConductorPrimerViaje: totalCostoPrimerViaje
    };
  }, [datosSemanasSeleccionadas]);

  const seleccionarSemana = (semana: number) => {
    setSelectorSemanasAbierto(false);
    if (!semanasSeleccionadas.includes(semana)) {
      setSemanasSeleccionadas([semana]);
    }
  };

  const toggleSemana = (semana: number) => {
    setSemanasSeleccionadas((prev) => {
      if (prev.includes(semana)) {
        if (prev.length === 1) return prev; // mantener al menos una semana seleccionada
        return prev.filter(s => s !== semana).sort((a, b) => b - a);
      }
      return [...prev, semana].sort((a, b) => b - a);
    });
  };

  const seleccionSimple = semanasSeleccionadas.length === 1;
  const semanaPrincipal = seleccionSimple ? semanasSeleccionadas[0] : null;
  const datosSemanaPrincipal = seleccionSimple
    ? datosSemanasSeleccionadas.find(h => h.semanaISO === semanaPrincipal) || null
    : null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header Moderno */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-4 lg:px-6 lg:py-5 flex-shrink-0 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
              >
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-white">
                  Vista Detallada de Campaña
                </h2>
                <p className="text-gray-400 text-sm truncate">{campana.nombre}</p>
              </div>
            </div>
            <button
              onClick={onCerrar}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg flex-shrink-0"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-primary-500 mb-4" />
              <span className="text-lg font-bold text-gray-900">Cargando detalles...</span>
            </div>
          ) : (
            <>
              {/* Información General de la Campaña */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" style={{ color: '#ef0000' }} />
                  Información General
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">ID</p>
                      <p className="text-sm font-bold text-gray-900">#{campana.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">País</p>
                      <p className="text-sm font-bold text-gray-900">{PAISES_LABELS[campana.pais] || campana.pais}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TargetIcon className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Vertical</p>
                      <p className="text-sm font-bold text-gray-900">{VERTICALES_LABELS[campana.vertical] || campana.vertical}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Plataforma</p>
                      <p className="text-sm font-bold text-gray-900">{PLATAFORMAS_LABELS[campana.plataforma] || campana.plataforma}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Segmento</p>
                      <p className="text-sm font-bold text-gray-900">{campana.segmento}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Dueño</p>
                      <p className="text-sm font-bold text-gray-900">{campana.nombreDueno}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Tipo de Aterrizaje</p>
                      <p className="text-sm font-bold text-gray-900">{TIPOS_ATERRIZAJE_LABELS[campana.tipoAterrizaje]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Estado</p>
                      <p className="text-sm font-bold text-gray-900">{campana.estado}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-600">Fecha de Creación</p>
                      <p className="text-sm font-bold text-gray-900">{new Date(campana.fechaCreacion).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                </div>
                {campana.urlAterrizaje && (
                  <div className="mt-4 flex items-start gap-2">
                    <Link2 className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Aterrizaje</p>
                      <a 
                        href={campana.urlAterrizaje} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 break-all font-medium"
                      >
                        {campana.urlAterrizaje}
                      </a>
                    </div>
                  </div>
                )}
                {campana.detalleAterrizaje && (
                  <div className="mt-4 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Detalles del Formulario</p>
                      <p className="text-sm text-gray-900 font-medium">{campana.detalleAterrizaje}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Selector de Semana */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 mb-6 shadow-sm">
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: '#ef0000' }} />
                  Seleccionar semanas para ver detalles
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3" ref={selectorRef}>
                  <div className="relative w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectorSemanasAbierto(prev => !prev)}
                      className="w-full sm:w-72 px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
                    >
                      {semanasSeleccionadas.length === 0
                        ? 'Selecciona semanas'
                        : `Semanas: ${semanasSeleccionadas.join(', ')}`}
                    </button>
                    {selectorSemanasAbierto && (
                      <div className="absolute z-10 mt-2 w-full sm:w-72 bg-white border border-blue-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {semanasDisponibles.map((semana) => {
                          const seleccionado = semanasSeleccionadas.includes(semana);
                          return (
                            <label
                              key={semana}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                checked={seleccionado}
                                onChange={() => toggleSemana(semana)}
                              />
                              <span>
                                Semana {semana} {semana === obtenerSemanaActual() ? '(Actual)' : ''}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {seleccionSimple && semanaPrincipal !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectorSemanasAbierto(false)}
                      className="text-xs text-blue-700 hover:text-blue-900 underline"
                    >
                      Vista individual (Semana {semanaPrincipal})
                    </button>
                  )}
                  {semanasSeleccionadas.length > 1 && (
                    <div className="text-xs text-blue-700 font-medium">
                      {semanasSeleccionadas.length} semanas seleccionadas
                    </div>
                  )}
                </div>
              </div>

              {/* Métricas con filtro */}
              {datosSemanasSeleccionadas.length > 0 && (
                <div className="space-y-4">
                  {seleccionSimple && datosSemanaPrincipal ? (
                    <>
                      {/* Métricas del Trafficker */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" style={{ color: '#ef0000' }} />
                          Métricas del Trafficker - Semana {semanaPrincipal}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1 font-medium">Alcance</p>
                              <p className="text-xl font-extrabold text-gray-900">
                                {(datosSemanaPrincipal.alcance || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                              <MousePointer className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1 font-medium">Clics</p>
                              <p className="text-xl font-extrabold text-gray-900">
                                {(datosSemanaPrincipal.clics || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                              <TargetIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1 font-medium">Leads</p>
                              <p className="text-xl font-extrabold text-gray-900">
                                {(datosSemanaPrincipal.leads || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1 font-medium">Costo Semanal (USD)</p>
                              <p className="text-xl font-extrabold text-gray-900">
                                ${(datosSemanaPrincipal.costoSemanal || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                              <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600 mb-1 font-medium">Costo por Lead (USD)</p>
                              <p className="text-xl font-extrabold text-gray-900">
                                ${(datosSemanaPrincipal.costoLead || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                          {datosSemanaPrincipal.urlInforme && (
                            <div className="md:col-span-2 lg:col-span-3 flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                                <Link2 className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1 font-medium">URL del Informe</p>
                                <a 
                                  href={datosSemanaPrincipal.urlInforme} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 break-all font-medium"
                                >
                                  {datosSemanaPrincipal.urlInforme}
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Métricas del Dueño */}
                      {(datosSemanaPrincipal.conductoresRegistrados !== undefined || datosSemanaPrincipal.conductoresPrimerViaje !== undefined) && (
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <Users className="w-5 h-5" style={{ color: '#ef0000' }} />
                            Métricas del Dueño - Semana {semanaPrincipal}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1 font-medium">Conductores Registrados</p>
                                <p className="text-xl font-extrabold text-gray-900">
                                  {(datosSemanaPrincipal.conductoresRegistrados || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                <Car className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 mb-1 font-medium">Conductores Primer Viaje</p>
                                <p className="text-xl font-extrabold text-gray-900">
                                  {(datosSemanaPrincipal.conductoresPrimerViaje || 0).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            {datosSemanaPrincipal.costoConductorRegistrado !== undefined && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Costo por Conductor Registrado (USD)</p>
                                  <p className="text-xl font-extrabold text-gray-900">
                                    ${(datosSemanaPrincipal.costoConductorRegistrado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            )}
                            {datosSemanaPrincipal.costoConductorPrimerViaje !== undefined && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Costo por Conductor Primer Viaje (USD)</p>
                                  <p className="text-xl font-extrabold text-gray-900">
                                    ${(datosSemanaPrincipal.costoConductorPrimerViaje || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : seleccionSimple && semanaPrincipal === obtenerSemanaActual() ? (
                    // Mostrar datos actuales de la campaña si es la semana actual
                    <>
                      {/* Métricas del Trafficker */}
                      {(campana.alcance != null || campana.clics != null || campana.leads != null) && (
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" style={{ color: '#ef0000' }} />
                            Métricas del Trafficker - Semana {semanaPrincipal} (Actual)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {campana.alcance != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Alcance</p>
                                  <p className="text-xl font-extrabold text-gray-900">{campana.alcance.toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                            {campana.clics != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                  <MousePointer className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Clics</p>
                                  <p className="text-xl font-extrabold text-gray-900">{campana.clics.toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                            {campana.leads != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                  <TargetIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Leads</p>
                                  <p className="text-xl font-extrabold text-gray-900">{campana.leads.toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                            {campana.costoSemanal != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Costo Semanal (USD)</p>
                                  <p className="text-xl font-extrabold text-gray-900">
                                    ${campana.costoSemanal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            )}
                            {campana.costoLead != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Costo por Lead (USD)</p>
                                  <p className="text-xl font-extrabold text-gray-900">
                                    ${campana.costoLead.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            )}
                            {campana.urlInforme && (
                              <div className="md:col-span-2 lg:col-span-3 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
                                  <Link2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">URL del Informe</p>
                                  <a 
                                    href={campana.urlInforme} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-800 break-all font-medium"
                                  >
                                    {campana.urlInforme}
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Métricas del Dueño */}
                      {(campana.conductoresRegistrados != null || campana.conductoresPrimerViaje != null) && (
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <Users className="w-5 h-5" style={{ color: '#ef0000' }} />
                            Métricas del Dueño - Semana {semanaPrincipal} (Actual)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {campana.conductoresRegistrados != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                  <UserPlus className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Conductores Registrados</p>
                                  <p className="text-xl font-extrabold text-gray-900">{campana.conductoresRegistrados.toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                            {campana.conductoresPrimerViaje != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                  <Car className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Conductores Primer Viaje</p>
                                  <p className="text-xl font-extrabold text-gray-900">{campana.conductoresPrimerViaje.toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                            {campana.costoConductorRegistrado != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Costo por Conductor Registrado (USD)</p>
                                  <p className="text-xl font-extrabold text-gray-900">
                                    ${campana.costoConductorRegistrado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            )}
                            {campana.costoConductorPrimerViaje != null && (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                                  <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-600 mb-1 font-medium">Costo por Conductor Primer Viaje (USD)</p>
                                  <p className="text-xl font-extrabold text-gray-900">
                                    ${campana.costoConductorPrimerViaje.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl p-5 text-center shadow-sm">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
                        <Info className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-900 font-bold text-lg">
                        No hay métricas disponibles para la semana {semanaPrincipal}
                      </p>
                    </div>
                  )}

                  {!seleccionSimple && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" style={{ color: '#ef0000' }} />
                            Resumen Trafficker ({semanasSeleccionadas.length} semanas)
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Alcance Total</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                {(resumenTrafficker?.alcance || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Clics Totales</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                {(resumenTrafficker?.clics || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Leads Totales</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                {(resumenTrafficker?.leads || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Costo Total (USD)</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                ${(resumenTrafficker?.costoSemanal || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Costo/Lead Promedio (USD)</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                {resumenTrafficker?.costoLeadPromedio != null
                                  ? `$${resumenTrafficker.costoLeadPromedio.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-5 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
                            <Users className="w-5 h-5" style={{ color: '#ef0000' }} />
                            Resumen Dueño ({semanasSeleccionadas.length} semanas)
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Conductores Registrados</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                {(resumenDueno?.conductoresRegistrados || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Conductores Primer Viaje</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                {(resumenDueno?.conductoresPrimerViaje || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Costo Total Registrado (USD)</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                ${(resumenDueno?.costoConductorRegistrado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                              <span className="text-sm font-medium text-gray-700">Costo Total Primer Viaje (USD)</span>
                              <span className="text-xl font-extrabold text-gray-900">
                                ${(resumenDueno?.costoConductorPrimerViaje || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {datosSemanasSeleccionadas.map((semana) => (
                          <div key={semana.semanaISO} className="bg-white border border-gray-200 rounded-xl p-5 shadow-md">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
                              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5" style={{ color: '#ef0000' }} />
                                Semana {semana.semanaISO}
                                {semana.semanaISO === obtenerSemanaActual() ? ' (Actual)' : ''}
                              </h4>
                              <button
                                type="button"
                                onClick={() => seleccionarSemana(semana.semanaISO)}
                                className="px-4 py-2 text-xs font-bold text-white rounded-lg transition-all hover:shadow-md"
                                style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                              >
                                Ver solo esta semana
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm">
                                <h5 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4" style={{ color: '#ef0000' }} />
                                  Métricas Trafficker
                                </h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-blue-700 text-xs mb-1">Alcance</p>
                                    <p className="font-bold text-blue-900">{(semana.alcance || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-700 text-xs mb-1">Clics</p>
                                    <p className="font-bold text-blue-900">{(semana.clics || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-700 text-xs mb-1">Leads</p>
                                    <p className="font-bold text-blue-900">{(semana.leads || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-blue-700 text-xs mb-1">Costo Semanal</p>
                                    <p className="font-bold text-blue-900">
                                      ${(semana.costoSemanal || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-blue-700 text-xs mb-1">Costo/Lead</p>
                                    <p className="font-bold text-blue-900">
                                      ${(semana.costoLead || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                  {semana.urlInforme && (
                                    <div className="col-span-2">
                                      <a
                                        href={semana.urlInforme}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 break-all"
                                      >
                                        Ver informe
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                <h5 className="text-sm font-semibold text-orange-900 mb-3">👥 Métricas Dueño</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-orange-700 text-xs mb-1">Registrados</p>
                                    <p className="font-bold text-orange-900">{(semana.conductoresRegistrados || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-orange-700 text-xs mb-1">Primer Viaje</p>
                                    <p className="font-bold text-orange-900">{(semana.conductoresPrimerViaje || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-orange-700 text-xs mb-1">Costo Registrado</p>
                                    <p className="font-bold text-orange-900">
                                      ${(semana.costoConductorRegistrado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-orange-700 text-xs mb-1">Costo Primer Viaje</p>
                                    <p className="font-bold text-orange-900">
                                      ${(semana.costoConductorPrimerViaje || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Resumen de Evolución */}
                  {historico.length > 1 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Resumen de Evolución</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300">
                              <th className="text-left py-2 px-3 font-semibold text-gray-700">Semana</th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-700">Alcance</th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-700">Leads</th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-700">Costo (USD)</th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-700">Costo/Lead</th>
                              <th className="text-right py-2 px-3 font-semibold text-gray-700">Conductores</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...historico].sort((a, b) => b.semanaISO - a.semanaISO).map((h) => (
                              <tr 
                                key={h.semanaISO} 
                                className={`border-b border-gray-200 hover:bg-gray-100 cursor-pointer ${semanasSeleccionadas.includes(h.semanaISO) ? 'bg-blue-50' : ''}`}
                                onClick={() => setSemanasSeleccionadas([h.semanaISO])}
                              >
                                <td className="py-2 px-3 font-medium">{h.semanaISO}</td>
                                <td className="text-right py-2 px-3">{(h.alcance || 0).toLocaleString()}</td>
                                <td className="text-right py-2 px-3">{(h.leads || 0).toLocaleString()}</td>
                                <td className="text-right py-2 px-3">${(h.costoSemanal || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="text-right py-2 px-3">${(h.costoLead || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="text-right py-2 px-3">{(h.conductoresPrimerViaje || 0).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Historial de Tareas Completadas */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 mt-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" style={{ color: '#ef0000' }} />
                      Historial de Tareas Completadas
                    </h3>
                    {cargandoTareas ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
                        <span className="text-sm font-medium text-green-700">Cargando historial...</span>
                      </div>
                    ) : tareasCompletadas.length === 0 ? (
                      <p className="text-green-700 text-sm font-medium">No hay tareas completadas aún para esta campaña.</p>
                    ) : (
                      <div className="space-y-3">
                        {tareasCompletadas.map((tarea) => (
                          <div
                            key={tarea.id}
                            className="bg-white border border-green-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-700 flex-shrink-0">
                                {getIconoTarea(tarea.tipoTarea)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-gray-900">{tarea.tipoTarea}</h4>
                                  {tarea.urgente && (
                                    <span className="inline-block px-2 py-1 text-xs font-bold bg-red-100 text-red-800 rounded-full">
                                      URGENTE
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 mb-3 font-medium">{tarea.descripcion}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <Flag className="w-3 h-3" />
                                    {tarea.responsableRol}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    Asignado a: <strong>{tarea.asignadoA}</strong>
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Creada: {new Date(tarea.fechaCreacion).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </span>
                                  {tarea.fechaCompletada && (
                                    <span className="flex items-center gap-1 text-green-700 font-bold">
                                      <CheckCircle className="w-3 h-3" />
                                      Completada: {new Date(tarea.fechaCompletada).toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onCerrar}
              className="px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              <X className="w-4 h-4" />
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


