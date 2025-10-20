import { useState } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { cargarHistoricoReal } from '../../utils/cargarHistoricoReal';
import { limpiarTodosLosDatos, limpiarCampanas, limpiarHistorico } from '../../utils/limpiarDatos';

type FiltroDashboard = 'todas' | 'activas' | 'archivadas' | 'pendientes';

export default function Dashboard() {
  const { campanas, historico } = useCampanaStore();
  const [filtroActivo, setFiltroActivo] = useState<FiltroDashboard>('todas');
  const [cargandoHistorico, setCargandoHistorico] = useState(false);
  const [limpiando, setLimpiando] = useState(false);

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

  const manejarCargarHistorico = async () => {
    setCargandoHistorico(true);
    try {
      const resultado = await cargarHistoricoReal();
      if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        // Recargar la página para mostrar los nuevos datos
        window.location.reload();
      } else {
        alert(`❌ ${resultado.mensaje}`);
      }
    } catch (error) {
      alert(`❌ Error cargando histórico: ${error}`);
    } finally {
      setCargandoHistorico(false);
    }
  };

  const manejarLimpiarTodo = async () => {
    const confirmar = window.confirm(
      `⚠️ ¿ESTÁS SEGURO de que quieres eliminar TODOS los datos?\n\n` +
      `Esto eliminará:\n` +
      `• Todas las campañas\n` +
      `• Todo el histórico\n` +
      `• Todos los datos guardados\n\n` +
      `⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER ⚠️\n\n` +
      `¿Continuar con la eliminación total?`
    );

    if (!confirmar) return;

    setLimpiando(true);
    try {
      const resultado = limpiarTodosLosDatos();
      if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        // Recargar la página para mostrar el estado limpio
        window.location.reload();
      } else {
        alert(`❌ ${resultado.mensaje}`);
      }
    } catch (error) {
      alert(`❌ Error limpiando datos: ${error}`);
    } finally {
      setLimpiando(false);
    }
  };

  const manejarLimpiarCampanas = async () => {
    const confirmar = window.confirm(
      `¿Eliminar todas las campañas?\n\n` +
      `Esto eliminará:\n` +
      `• Todas las campañas activas\n` +
      `• Todas las campañas pendientes\n` +
      `• Datos de métricas guardados\n\n` +
      `El histórico se mantendrá intacto.\n\n` +
      `¿Continuar?`
    );

    if (!confirmar) return;

    try {
      const resultado = limpiarCampanas();
      if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        window.location.reload();
      } else {
        alert(`❌ ${resultado.mensaje}`);
      }
    } catch (error) {
      alert(`❌ Error limpiando campañas: ${error}`);
    }
  };

  const manejarLimpiarHistorico = async () => {
    const confirmar = window.confirm(
      `¿Eliminar todo el histórico?\n\n` +
      `Esto eliminará:\n` +
      `• Todas las campañas archivadas\n` +
      `• Métricas históricas\n` +
      `• Datos de evolución semanal\n\n` +
      `Las campañas activas se mantendrán intactas.\n\n` +
      `¿Continuar?`
    );

    if (!confirmar) return;

    try {
      const resultado = limpiarHistorico();
      if (resultado.exito) {
        alert(`✅ ${resultado.mensaje}`);
        window.location.reload();
      } else {
        alert(`❌ ${resultado.mensaje}`);
      }
    } catch (error) {
      alert(`❌ Error limpiando histórico: ${error}`);
    }
  };

  const tarjetas = [
    { titulo: 'Total Campañas', valor: estadisticas.total, icono: '🎯', color: 'bg-blue-500' },
    { titulo: 'Activas', valor: estadisticas.activas, icono: '✅', color: 'bg-green-500' },
    { titulo: 'Pendientes', valor: estadisticas.pendientes, icono: '⏳', color: 'bg-yellow-500' },
    { titulo: 'Creativo Enviado', valor: estadisticas.creativoEnviado, icono: '📤', color: 'bg-blue-400' },
  ];

  const metricasTarjetas = [
    { titulo: 'Alcance Total', valor: metricas.totalAlcance.toLocaleString(), icono: '👥', color: 'bg-purple-500' },
    { titulo: 'Total Clics', valor: metricas.totalClics.toLocaleString(), icono: '🖱️', color: 'bg-indigo-500' },
    { titulo: 'Total Leads', valor: metricas.totalLeads.toLocaleString(), icono: '📝', color: 'bg-pink-500' },
    { titulo: 'Inversión Semanal', valor: `S/ ${metricas.totalCosto.toFixed(2)}`, icono: '💰', color: 'bg-green-600' },
    { titulo: 'Conductores Reg.', valor: metricas.totalConductores.toLocaleString(), icono: '🚗', color: 'bg-orange-500' },
    { titulo: 'Primer Viaje', valor: metricas.totalPrimerViaje.toLocaleString(), icono: '🏁', color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-gray-600 mt-1">Resumen general del sistema de campañas</p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-2">
                {/* Botón para cargar histórico automáticamente */}
                <button
                  onClick={manejarCargarHistorico}
                  disabled={cargandoHistorico}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                >
                  {cargandoHistorico ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Cargando CSV...</span>
                    </>
                  ) : (
                    <>
                      <span>📊</span>
                      <span>Cargar CSV Histórico</span>
                    </>
                  )}
                </button>

                {/* Botón para limpiar todo */}
                <button
                  onClick={manejarLimpiarTodo}
                  disabled={limpiando}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  title="⚠️ Elimina TODOS los datos del sistema"
                >
                  {limpiando ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      <span>Limpiando...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Limpiar Todo</span>
                    </>
                  )}
                </button>

                {/* Botón para limpiar solo campañas */}
                <button
                  onClick={manejarLimpiarCampanas}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  title="Elimina solo las campañas (mantiene histórico)"
                >
                  <span>🎯</span>
                  <span>Limpiar Campañas</span>
                </button>

                {/* Botón para limpiar solo histórico */}
                <button
                  onClick={manejarLimpiarHistorico}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  title="Elimina solo el histórico (mantiene campañas)"
                >
                  <span>📊</span>
                  <span>Limpiar Histórico</span>
                </button>
              </div>
            </div>
        
        {/* Filtros */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroActivo('todas')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroActivo === 'todas'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Todas ({campanas.length})
          </button>
          <button
            onClick={() => setFiltroActivo('activas')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroActivo === 'activas'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✅ Activas ({estadisticas.activas})
          </button>
          <button
            onClick={() => setFiltroActivo('pendientes')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroActivo === 'pendientes'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⏳ Pendientes ({estadisticas.pendientes + estadisticas.creativoEnviado})
          </button>
          <button
            onClick={() => setFiltroActivo('archivadas')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filtroActivo === 'archivadas'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📁 Archivadas ({estadisticas.archivadas})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetas.map((tarjeta, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{tarjeta.titulo}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{tarjeta.valor}</p>
              </div>
              <div className={`${tarjeta.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                {tarjeta.icono}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Métricas {filtroActivo === 'todas' ? 'Generales' : filtroActivo === 'activas' ? 'Campañas Activas' : filtroActivo === 'archivadas' ? 'Campañas Archivadas' : 'Campañas Pendientes'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricasTarjetas.map((tarjeta, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className={`${tarjeta.color} w-14 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                  {tarjeta.icono}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-600">{tarjeta.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{tarjeta.valor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evolución Semanal */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Evolución Semanal (Últimas 4 Semanas)</h3>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {evolucionSemanal.map((semana, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Sem {semana.numeroSemana}</h4>
                  <p className="text-sm text-gray-600 mb-4">{semana.semana}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Leads:</span>
                      <span className="font-semibold text-blue-600">{semana.leads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-semibold text-green-600">S/ {semana.costo.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Conductores:</span>
                      <span className="font-semibold text-orange-600">{semana.conductores}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Campañas:</span>
                      <span className="font-semibold text-purple-600">{semana.campañas}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {evolucionSemanal.every(s => s.campañas === 0) && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No hay datos de evolución semanal disponibles</p>
              <p className="text-sm">Las métricas aparecerán cuando se archiven campañas</p>
            </div>
          )}
        </div>
      </div>

      {campanasFiltradas.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Top 5 Campañas por Rendimiento</h3>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Campaña
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Segmento
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Leads
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Costo/Lead
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Conductores
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {campanasFiltradas
                    .filter(c => c.leads && c.leads > 0)
                    .sort((a, b) => (b.leads || 0) - (a.leads || 0))
                    .slice(0, 5)
                    .map((campana) => (
                      <tr key={campana.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{campana.nombre}</div>
                              <div className="text-xs text-gray-500">{campana.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {campana.segmento}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          {campana.leads?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          S/ {campana.costoLead?.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          {campana.conductoresRegistrados || 0}
                        </td>
                      </tr>
                    ))}
                  {campanasFiltradas.filter(c => c.leads && c.leads > 0).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No hay campañas con métricas disponibles
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

