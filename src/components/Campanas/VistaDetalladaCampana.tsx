import { useState, useEffect, useMemo, useRef } from 'react';
import { Campana, HistoricoSemanalCampana, TareaPendiente } from '../../types';
import { useCampanaStore } from '../../store/useCampanaStore';
import { getISOWeek } from 'date-fns';
import { PAISES_LABELS, VERTICALES_LABELS, PLATAFORMAS_LABELS, TIPOS_ATERRIZAJE_LABELS } from '../../types';
import { tareaService } from '../../services/tareaService';

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
        return '➕';
      case 'Enviar Creativo':
        return '📎';
      case 'Activar Campaña':
        return '✅';
      case 'Subir Métricas Trafficker':
        return '📊';
      case 'Subir Métricas Dueño':
        return '👥';
      case 'Archivar Campaña':
        return '📁';
      default:
        return '📋';
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 lg:px-6 lg:py-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg lg:text-2xl font-bold">📊 Vista Detallada de Campaña</h2>
              <p className="text-primary-100 text-xs lg:text-sm mt-1 truncate">{campana.nombre}</p>
            </div>
            <button
              onClick={onCerrar}
              className="text-white hover:text-primary-200 transition-colors flex-shrink-0 ml-4"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {cargando ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Cargando detalles...</span>
            </div>
          ) : (
            <>
              {/* Información General de la Campaña */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">ID</p>
                    <p className="text-sm font-semibold text-gray-900">#{campana.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">País</p>
                    <p className="text-sm font-semibold text-gray-900">{PAISES_LABELS[campana.pais] || campana.pais}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Vertical</p>
                    <p className="text-sm font-semibold text-gray-900">{VERTICALES_LABELS[campana.vertical] || campana.vertical}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Plataforma</p>
                    <p className="text-sm font-semibold text-gray-900">{PLATAFORMAS_LABELS[campana.plataforma] || campana.plataforma}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Segmento</p>
                    <p className="text-sm font-semibold text-gray-900">{campana.segmento}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Dueño</p>
                    <p className="text-sm font-semibold text-gray-900">{campana.nombreDueno}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Tipo de Aterrizaje</p>
                    <p className="text-sm font-semibold text-gray-900">{TIPOS_ATERRIZAJE_LABELS[campana.tipoAterrizaje]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Estado</p>
                    <p className="text-sm font-semibold text-gray-900">{campana.estado}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Fecha de Creación</p>
                    <p className="text-sm font-semibold text-gray-900">{new Date(campana.fechaCreacion).toLocaleDateString('es-ES')}</p>
                  </div>
                </div>
                {campana.urlAterrizaje && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-1">Aterrizaje</p>
                    <a 
                      href={campana.urlAterrizaje} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 break-all"
                    >
                      {campana.urlAterrizaje}
                    </a>
                  </div>
                )}
                {campana.detalleAterrizaje && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-600 mb-1">Detalles del Formulario</p>
                    <p className="text-sm text-gray-900">{campana.detalleAterrizaje}</p>
                  </div>
                )}
              </div>

              {/* Selector de Semana */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📅 Seleccionar semanas para ver detalles
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3" ref={selectorRef}>
                  <div className="relative w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectorSemanasAbierto(prev => !prev)}
                      className="w-full sm:w-72 px-4 py-2 border border-blue-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
                                className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
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
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-bold text-blue-900 mb-4">📊 Métricas del Trafficker - Semana {semanaPrincipal}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-blue-700 mb-1">Alcance</p>
                            <p className="text-xl font-bold text-blue-900">
                              {(datosSemanaPrincipal.alcance || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 mb-1">Clics</p>
                            <p className="text-xl font-bold text-blue-900">
                              {(datosSemanaPrincipal.clics || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 mb-1">Leads</p>
                            <p className="text-xl font-bold text-blue-900">
                              {(datosSemanaPrincipal.leads || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 mb-1">Costo Semanal (USD)</p>
                            <p className="text-xl font-bold text-blue-900">
                              ${(datosSemanaPrincipal.costoSemanal || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-700 mb-1">Costo por Lead (USD)</p>
                            <p className="text-xl font-bold text-blue-900">
                              ${(datosSemanaPrincipal.costoLead || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          {datosSemanaPrincipal.urlInforme && (
                            <div className="md:col-span-2 lg:col-span-3">
                              <p className="text-xs text-blue-700 mb-1">URL del Informe</p>
                              <a 
                                href={datosSemanaPrincipal.urlInforme} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 break-all"
                              >
                                {datosSemanaPrincipal.urlInforme}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Métricas del Dueño */}
                      {(datosSemanaPrincipal.conductoresRegistrados !== undefined || datosSemanaPrincipal.conductoresPrimerViaje !== undefined) && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h3 className="text-lg font-bold text-orange-900 mb-4">👥 Métricas del Dueño - Semana {semanaPrincipal}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-orange-700 mb-1">Conductores Registrados</p>
                              <p className="text-xl font-bold text-orange-900">
                                {(datosSemanaPrincipal.conductoresRegistrados || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-700 mb-1">Conductores Primer Viaje</p>
                              <p className="text-xl font-bold text-orange-900">
                                {(datosSemanaPrincipal.conductoresPrimerViaje || 0).toLocaleString()}
                              </p>
                            </div>
                            {datosSemanaPrincipal.costoConductorRegistrado !== undefined && (
                              <div>
                                <p className="text-xs text-orange-700 mb-1">Costo por Conductor Registrado (USD)</p>
                                <p className="text-xl font-bold text-orange-900">
                                  ${(datosSemanaPrincipal.costoConductorRegistrado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            )}
                            {datosSemanaPrincipal.costoConductorPrimerViaje !== undefined && (
                              <div>
                                <p className="text-xs text-orange-700 mb-1">Costo por Conductor Primer Viaje (USD)</p>
                                <p className="text-xl font-bold text-orange-900">
                                  ${(datosSemanaPrincipal.costoConductorPrimerViaje || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
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
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-lg font-bold text-blue-900 mb-4">📊 Métricas del Trafficker - Semana {semanaPrincipal} (Actual)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {campana.alcance != null && (
                              <div>
                                <p className="text-xs text-blue-700 mb-1">Alcance</p>
                                <p className="text-xl font-bold text-blue-900">{campana.alcance.toLocaleString()}</p>
                              </div>
                            )}
                            {campana.clics != null && (
                              <div>
                                <p className="text-xs text-blue-700 mb-1">Clics</p>
                                <p className="text-xl font-bold text-blue-900">{campana.clics.toLocaleString()}</p>
                              </div>
                            )}
                            {campana.leads != null && (
                              <div>
                                <p className="text-xs text-blue-700 mb-1">Leads</p>
                                <p className="text-xl font-bold text-blue-900">{campana.leads.toLocaleString()}</p>
                              </div>
                            )}
                            {campana.costoSemanal != null && (
                              <div>
                                <p className="text-xs text-blue-700 mb-1">Costo Semanal (USD)</p>
                                <p className="text-xl font-bold text-blue-900">
                                  ${campana.costoSemanal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            )}
                            {campana.costoLead != null && (
                              <div>
                                <p className="text-xs text-blue-700 mb-1">Costo por Lead (USD)</p>
                                <p className="text-xl font-bold text-blue-900">
                                  ${campana.costoLead.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            )}
                            {campana.urlInforme && (
                              <div className="md:col-span-2 lg:col-span-3">
                                <p className="text-xs text-blue-700 mb-1">URL del Informe</p>
                                <a 
                                  href={campana.urlInforme} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-800 break-all"
                                >
                                  {campana.urlInforme}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Métricas del Dueño */}
                      {(campana.conductoresRegistrados != null || campana.conductoresPrimerViaje != null) && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h3 className="text-lg font-bold text-orange-900 mb-4">👥 Métricas del Dueño - Semana {semanaPrincipal} (Actual)</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {campana.conductoresRegistrados != null && (
                              <div>
                                <p className="text-xs text-orange-700 mb-1">Conductores Registrados</p>
                                <p className="text-xl font-bold text-orange-900">{campana.conductoresRegistrados.toLocaleString()}</p>
                              </div>
                            )}
                            {campana.conductoresPrimerViaje != null && (
                              <div>
                                <p className="text-xs text-orange-700 mb-1">Conductores Primer Viaje</p>
                                <p className="text-xl font-bold text-orange-900">{campana.conductoresPrimerViaje.toLocaleString()}</p>
                              </div>
                            )}
                            {campana.costoConductorRegistrado != null && (
                              <div>
                                <p className="text-xs text-orange-700 mb-1">Costo por Conductor Registrado (USD)</p>
                                <p className="text-xl font-bold text-orange-900">
                                  ${campana.costoConductorRegistrado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            )}
                            {campana.costoConductorPrimerViaje != null && (
                              <div>
                                <p className="text-xs text-orange-700 mb-1">Costo por Conductor Primer Viaje (USD)</p>
                                <p className="text-xl font-bold text-orange-900">
                                  ${campana.costoConductorPrimerViaje.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        No hay métricas disponibles para la semana {semanaPrincipal}
                      </p>
                    </div>
                  )}

                  {!seleccionSimple && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-lg font-bold text-blue-900 mb-4">
                            📊 Resumen Trafficker ({semanasSeleccionadas.length} semanas)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-blue-700 mb-1">Alcance Total</p>
                              <p className="text-xl font-bold text-blue-900">
                                {(resumenTrafficker?.alcance || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-700 mb-1">Clics Totales</p>
                              <p className="text-xl font-bold text-blue-900">
                                {(resumenTrafficker?.clics || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-700 mb-1">Leads Totales</p>
                              <p className="text-xl font-bold text-blue-900">
                                {(resumenTrafficker?.leads || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-700 mb-1">Costo Total (USD)</p>
                              <p className="text-xl font-bold text-blue-900">
                                ${(resumenTrafficker?.costoSemanal || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-blue-700 mb-1">Costo/Lead Promedio (USD)</p>
                              <p className="text-xl font-bold text-blue-900">
                                {resumenTrafficker?.costoLeadPromedio != null
                                  ? `$${resumenTrafficker.costoLeadPromedio.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                  : '—'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h3 className="text-lg font-bold text-orange-900 mb-4">
                            👥 Resumen Dueño ({semanasSeleccionadas.length} semanas)
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-orange-700 mb-1">Conductores Registrados</p>
                              <p className="text-xl font-bold text-orange-900">
                                {(resumenDueno?.conductoresRegistrados || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-700 mb-1">Conductores Primer Viaje</p>
                              <p className="text-xl font-bold text-orange-900">
                                {(resumenDueno?.conductoresPrimerViaje || 0).toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-700 mb-1">Costo Total Registrado (USD)</p>
                              <p className="text-xl font-bold text-orange-900">
                                ${(resumenDueno?.costoConductorRegistrado || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-orange-700 mb-1">Costo Total Primer Viaje (USD)</p>
                              <p className="text-xl font-bold text-orange-900">
                                ${(resumenDueno?.costoConductorPrimerViaje || 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {datosSemanasSeleccionadas.map((semana) => (
                          <div key={semana.semanaISO} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-4">
                              <h4 className="text-lg font-bold text-gray-900">
                                Semana {semana.semanaISO}
                                {semana.semanaISO === obtenerSemanaActual() ? ' (Actual)' : ''}
                              </h4>
                              <button
                                type="button"
                                onClick={() => seleccionarSemana(semana.semanaISO)}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Ver solo esta semana
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 className="text-sm font-semibold text-blue-900 mb-3">📊 Métricas Trafficker</h5>
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
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h3 className="text-lg font-bold text-green-900 mb-4">✅ Historial de Tareas Completadas</h3>
                    {cargandoTareas ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span className="ml-3 text-green-700">Cargando historial...</span>
                      </div>
                    ) : tareasCompletadas.length === 0 ? (
                      <p className="text-green-700 text-sm">No hay tareas completadas aún para esta campaña.</p>
                    ) : (
                      <div className="space-y-3">
                        {tareasCompletadas.map((tarea) => (
                          <div
                            key={tarea.id}
                            className="bg-white border border-green-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl flex-shrink-0">{getIconoTarea(tarea.tipoTarea)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{tarea.tipoTarea}</h4>
                                  {tarea.urgente && (
                                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                                      URGENTE
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{tarea.descripcion}</p>
                                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                  <span>
                                    🏷️ {tarea.responsableRol}
                                  </span>
                                  <span>
                                    👤 Asignado a: <strong>{tarea.asignadoA}</strong>
                                  </span>
                                  <span>
                                    📅 Creada: {new Date(tarea.fechaCreacion).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                    })}
                                  </span>
                                  {tarea.fechaCompletada && (
                                    <span className="text-green-700 font-medium">
                                      ✅ Completada: {new Date(tarea.fechaCompletada).toLocaleDateString('es-ES', {
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
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onCerrar}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


