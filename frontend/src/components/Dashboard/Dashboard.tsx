import { useState, useEffect } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { Target, CheckCircle, Clock, Send, Users, MousePointer, FileText, DollarSign, Car, Flag, BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

type FiltroDashboard = 'todas' | 'activas' | 'archivadas' | 'pendientes';

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-300 rounded w-16"></div>
      </div>
      <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
    </div>
  </div>
);

const SkeletonMetricCard = () => (
  <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="w-16 h-16 bg-gray-200 rounded-xl flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-3 bg-gray-200 rounded w-28 mb-2"></div>
        <div className="h-6 bg-gray-300 rounded w-20"></div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { campanas, historico } = useCampanaStore();
  const [filtroActivo, setFiltroActivo] = useState<FiltroDashboard>('todas');
  const [isLoading, setIsLoading] = useState(true);
  const [metricsLoaded, setMetricsLoaded] = useState(false);

  // Función para obtener campañas según el filtro
  const obtenerCampanasFiltradas = () => {
    switch (filtroActivo) {
      case 'activas':
        return campanas.filter(c => c.estado === 'Activa');
      case 'archivadas':
        return campanas.filter(c => c.estado === 'Archivada');
      case 'pendientes':
        return campanas.filter(c => c.estado === 'Pendiente' || c.estado === 'Creativo Enviado');
      default:
        return campanas;
    }
  };

  // Función para obtener métricas del histórico
  const obtenerMetricasHistoricas = () => {
    if (filtroActivo === 'archivadas' || filtroActivo === 'todas') {
      return historico.reduce((acc, h) => ({
        alcance: acc.alcance + (h.alcance || 0),
        clics: acc.clics + (h.clics || 0),
        leads: acc.leads + (h.leads || 0),
        costo: acc.costo + (h.costoSemanal || 0),
        conductores: acc.conductores + (h.conductoresRegistrados || 0),
        primerViaje: acc.primerViaje + (h.conductoresPrimerViaje || 0),
      }), { alcance: 0, clics: 0, leads: 0, costo: 0, conductores: 0, primerViaje: 0 });
    }
    return { alcance: 0, clics: 0, leads: 0, costo: 0, conductores: 0, primerViaje: 0 };
  };

  const campanasFiltradas = obtenerCampanasFiltradas();
  const metricasHistoricas = obtenerMetricasHistoricas();

  const estadisticas = {
    total: campanas.length,
    pendientes: campanas.filter(c => c.estado === 'Pendiente').length,
    creativoEnviado: campanas.filter(c => c.estado === 'Creativo Enviado').length,
    activas: campanas.filter(c => c.estado === 'Activa').length,
    archivadas: campanas.filter(c => c.estado === 'Archivada').length,
  };

  // Métricas combinadas (activas + histórico según filtro)
  const metricas = {
    totalAlcance: campanasFiltradas.reduce((sum, c) => sum + (c.alcance || 0), 0) + metricasHistoricas.alcance,
    totalClics: campanasFiltradas.reduce((sum, c) => sum + (c.clics || 0), 0) + metricasHistoricas.clics,
    totalLeads: campanasFiltradas.reduce((sum, c) => sum + (c.leads || 0), 0) + metricasHistoricas.leads,
    totalCosto: campanasFiltradas.reduce((sum, c) => sum + (c.costoSemanal || 0), 0) + metricasHistoricas.costo,
    totalConductores: campanasFiltradas.reduce((sum, c) => sum + (c.conductoresRegistrados || 0), 0) + metricasHistoricas.conductores,
    totalPrimerViaje: campanasFiltradas.reduce((sum, c) => sum + (c.conductoresPrimerViaje || 0), 0) + metricasHistoricas.primerViaje,
  };

  // Evolución semanal (últimas 4 semanas)
  const obtenerEvolucionSemanal = () => {
    const ahora = new Date();
    const ultimas4Semanas = Array.from({ length: 4 }, (_, i) => {
      const semana = subWeeks(ahora, 3 - i);
      const inicioSemana = startOfWeek(semana, { weekStartsOn: 1 }); // Lunes
      const finSemana = endOfWeek(semana, { weekStartsOn: 1 }); // Domingo
      
      // Buscar en histórico por semana
      const registrosSemana = historico.filter(h => {
        const fechaArchivo = new Date(h.fechaArchivo);
        return fechaArchivo >= inicioSemana && fechaArchivo <= finSemana;
      });

      return {
        semana: format(inicioSemana, 'dd/MM', { locale: es }),
        numeroSemana: Math.ceil((inicioSemana.getTime() - new Date(inicioSemana.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
        leads: registrosSemana.reduce((sum, r) => sum + (r.leads || 0), 0),
        costo: registrosSemana.reduce((sum, r) => sum + (r.costoSemanal || 0), 0),
        conductores: registrosSemana.reduce((sum, r) => sum + (r.conductoresRegistrados || 0), 0),
        campañas: registrosSemana.length,
      };
    });

    return ultimas4Semanas;
  };

  const evolucionSemanal = obtenerEvolucionSemanal();

  // Simular carga de datos
  useEffect(() => {
    setIsLoading(true);
    setMetricsLoaded(false);
    
    // Simular delay de carga inicial
    const timer1 = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Simular delay de métricas
    const timer2 = setTimeout(() => {
      setMetricsLoaded(true);
    }, 1200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [filtroActivo]);

  // Calcular tendencia vs semana anterior
  const calcularTendencia = (metricaActual: number, metricaAnterior: number) => {
    if (metricaAnterior === 0) return { porcentaje: 0, tipo: 'neutral' as const };
    const cambio = ((metricaActual - metricaAnterior) / metricaAnterior) * 100;
    return {
      porcentaje: Math.abs(cambio),
      tipo: cambio > 0 ? 'up' as const : cambio < 0 ? 'down' as const : 'neutral' as const
    };
  };

  const tarjetas = [
    { titulo: 'Total Campañas', valor: estadisticas.total, Icon: Target, colorClass: 'bg-gradient-to-br from-blue-500 to-blue-600' },
    { titulo: 'Activas', valor: estadisticas.activas, Icon: CheckCircle, colorClass: 'bg-gradient-to-br from-green-500 to-green-600' },
    { titulo: 'Pendientes', valor: estadisticas.pendientes, Icon: Clock, colorClass: 'bg-gradient-to-br from-yellow-500 to-yellow-600' },
    { titulo: 'Creativo Enviado', valor: estadisticas.creativoEnviado, Icon: Send, colorClass: 'bg-gradient-to-br from-blue-400 to-blue-500' },
  ];

  const metricasTarjetas = [
    { titulo: 'Alcance Total', valor: metricas.totalAlcance.toLocaleString(), Icon: Users, color: 'bg-purple-500' },
    { titulo: 'Total Clics', valor: metricas.totalClics.toLocaleString(), Icon: MousePointer, color: 'bg-indigo-500' },
    { titulo: 'Total Leads', valor: metricas.totalLeads.toLocaleString(), Icon: FileText, color: 'bg-pink-500' },
    { titulo: 'Inversión Semanal', valor: `$${metricas.totalCosto.toFixed(2)} USD`, Icon: DollarSign, color: 'bg-green-600' },
    { titulo: 'Conductores Reg.', valor: metricas.totalConductores.toLocaleString(), Icon: Car, color: 'bg-orange-500' },
    { titulo: 'Primer Viaje', valor: metricas.totalPrimerViaje.toLocaleString(), Icon: Flag, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header con Loading Indicator */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Dashboard
        </h1>
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#ef0000' }} />
            <span className="text-sm font-medium">Cargando datos...</span>
          </div>
        )}
      </div>

      {/* Filtros Modernos */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFiltroActivo('todas')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md flex items-center gap-2 relative overflow-hidden group ${
              filtroActivo === 'todas'
                ? 'text-white shadow-xl transform scale-105'
                : 'bg-gradient-to-br from-gray-50 to-white text-gray-700 hover:shadow-xl hover:scale-105 border border-gray-200'
            }`}
            style={filtroActivo === 'todas' ? { background: 'linear-gradient(135deg, #ef0000, #dc0000)' } : {}}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-bold">Todas</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              filtroActivo === 'todas' ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {campanas.length}
            </span>
          </button>
          <button
            onClick={() => setFiltroActivo('activas')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md flex items-center gap-2 ${
              filtroActivo === 'activas'
                ? 'text-white shadow-xl transform scale-105'
                : 'bg-gradient-to-br from-gray-50 to-white text-gray-700 hover:shadow-xl hover:scale-105 border border-gray-200'
            }`}
            style={filtroActivo === 'activas' ? { background: 'linear-gradient(135deg, #ef0000, #dc0000)' } : {}}
          >
            <CheckCircle className="w-5 h-5" />
            <span className="font-bold">Activas</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              filtroActivo === 'activas' ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {estadisticas.activas}
            </span>
          </button>
          <button
            onClick={() => setFiltroActivo('pendientes')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md flex items-center gap-2 ${
              filtroActivo === 'pendientes'
                ? 'text-white shadow-xl transform scale-105'
                : 'bg-gradient-to-br from-gray-50 to-white text-gray-700 hover:shadow-xl hover:scale-105 border border-gray-200'
            }`}
            style={filtroActivo === 'pendientes' ? { background: 'linear-gradient(135deg, #ef0000, #dc0000)' } : {}}
          >
            <Clock className="w-5 h-5" />
            <span className="font-bold">Pendientes</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              filtroActivo === 'pendientes' ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {estadisticas.pendientes + estadisticas.creativoEnviado}
            </span>
          </button>
          <button
            onClick={() => setFiltroActivo('archivadas')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md flex items-center gap-2 ${
              filtroActivo === 'archivadas'
                ? 'text-white shadow-xl transform scale-105'
                : 'bg-gradient-to-br from-gray-50 to-white text-gray-700 hover:shadow-xl hover:scale-105 border border-gray-200'
            }`}
            style={filtroActivo === 'archivadas' ? { background: 'linear-gradient(135deg, #ef0000, #dc0000)' } : {}}
          >
            <FileText className="w-5 h-5" />
            <span className="font-bold">Archivadas</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              filtroActivo === 'archivadas' ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {estadisticas.archivadas}
            </span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" style={{ color: '#ef0000' }} />
          Estadísticas Generales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            tarjetas.map((tarjeta, index) => {
              const Icon = tarjeta.Icon;
              return (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {tarjeta.titulo}
                      </p>
                      <p className="text-5xl font-black text-gray-900 mb-1 group-hover:scale-110 transition-transform duration-300">
                        {tarjeta.valor}
                      </p>
                    </div>
                    <div 
                      className={`${tarjeta.colorClass} w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                    >
                      <Icon className="w-9 h-9 text-white" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Métricas de Rendimiento */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" style={{ color: '#ef0000' }} />
          Métricas {filtroActivo === 'todas' ? 'Generales' : filtroActivo === 'activas' ? 'Campañas Activas' : filtroActivo === 'archivadas' ? 'Campañas Archivadas' : 'Campañas Pendientes'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!metricsLoaded ? (
            <>
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
              <SkeletonMetricCard />
            </>
          ) : (
            metricasTarjetas.map((tarjeta, index) => {
              const Icon = tarjeta.Icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient Background Effect */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-100 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-center space-x-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                      style={{ 
                        background: index === 0 ? 'linear-gradient(135deg, #ef0000, #dc0000)' : 
                                   index === 1 ? 'linear-gradient(135deg, #4f46e5, #3730a3)' : 
                                   index === 2 ? 'linear-gradient(135deg, #ec4899, #be185d)' : 
                                   index === 3 ? 'linear-gradient(135deg, #10b981, #047857)' : 
                                   index === 4 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 
                                   'linear-gradient(135deg, #ef0000, #b91c1c)' 
                      }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {tarjeta.titulo}
                      </p>
                      <p className="text-3xl font-black text-gray-900 truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 transition-all duration-300">
                        {tarjeta.valor}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Evolución Semanal */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" style={{ color: '#ef0000' }} />
          Evolución Semanal (Últimas 4 Semanas)
        </h2>
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
          {evolucionSemanal.every(s => s.campañas === 0) ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-xl font-bold text-gray-700 mb-2">No hay datos de evolución semanal</p>
              <p className="text-sm text-gray-500">Las métricas aparecerán cuando se archiven campañas</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {evolucionSemanal.map((semana, index) => {
                const tieneDatos = semana.campañas > 0;
                return (
                  <div 
                    key={index} 
                    className="group relative animate-fadeIn"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-300 ${
                      tieneDatos 
                        ? 'border-gray-200 hover:border-gray-300 hover:shadow-2xl hover:-translate-y-2' 
                        : 'border-gray-100 opacity-50'
                    }`}>
                      {/* Header de Semana */}
                      <div className="text-center mb-6">
                        <div 
                          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 shadow-lg"
                          style={{ background: 'linear-gradient(135deg, #ef0000, #dc0000)' }}
                        >
                          <span className="text-2xl font-black text-white">{semana.numeroSemana}</span>
                        </div>
                        <p className="text-sm font-bold text-gray-600">{semana.semana}</p>
                      </div>
                      
                      {/* Métricas */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                          <span className="text-xs font-bold text-blue-900 uppercase">Leads</span>
                          <span className="text-lg font-black text-blue-700">{semana.leads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                          <span className="text-xs font-bold text-green-900 uppercase">Costo</span>
                          <span className="text-lg font-black text-green-700">${semana.costo.toFixed(0)}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                          <span className="text-xs font-bold text-orange-900 uppercase">Conductores</span>
                          <span className="text-lg font-black text-orange-700">{semana.conductores}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                          <span className="text-xs font-bold text-purple-900 uppercase">Campañas</span>
                          <span className="text-lg font-black text-purple-700">{semana.campañas}</span>
                        </div>
                      </div>

                      {/* Indicador de Tendencia */}
                      {index > 0 && tieneDatos && evolucionSemanal[index - 1].campañas > 0 && (
                        <div className="absolute -top-3 -right-3">
                          {semana.leads > evolucionSemanal[index - 1].leads ? (
                            <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                          ) : semana.leads < evolucionSemanal[index - 1].leads ? (
                            <div className="bg-red-500 text-white rounded-full p-2 shadow-lg">
                              <TrendingDown className="w-4 h-4" />
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top 5 Campañas */}
      {campanasFiltradas.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Flag className="w-5 h-5" style={{ color: '#ef0000' }} />
            Top 5 Campañas por Rendimiento
          </h2>
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Campaña
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                      Segmento
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <FileText className="w-4 h-4" />
                        Leads
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <DollarSign className="w-4 h-4" />
                        Costo/Lead
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-2">
                        <Car className="w-4 h-4" />
                        Conductores
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campanasFiltradas
                    .filter(c => c.leads && c.leads > 0)
                    .sort((a, b) => (b.leads || 0) - (a.leads || 0))
                    .slice(0, 5)
                    .map((campana, index) => (
                      <tr 
                        key={campana.id} 
                        className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 animate-fadeIn"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white shadow-lg group-hover:scale-110 transition-transform duration-200"
                              style={{ background: 'linear-gradient(135deg, #ef0000, #dc0000)' }}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 group-hover:text-gray-800">
                                {campana.nombre}
                              </div>
                              <div className="text-xs text-gray-500 font-medium">{campana.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                            {campana.segmento}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-xl font-black text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-blue-800">
                            {campana.leads?.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-lg font-bold text-green-700 group-hover:text-green-800">
                            ${campana.costoLead?.toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">USD</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-100 text-orange-800 font-bold text-sm">
                            {campana.conductoresRegistrados || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  {campanasFiltradas.filter(c => c.leads && c.leads > 0).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <BarChart3 className="w-10 h-10 text-gray-400" />
                          </div>
                          <p className="text-lg font-bold text-gray-700 mb-1">No hay campañas con métricas</p>
                          <p className="text-sm text-gray-500">Las campañas aparecerán cuando tengan datos de rendimiento</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

