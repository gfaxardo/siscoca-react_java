import { useState, useEffect } from 'react';
import { useCampanaStore } from '../../store/useCampanaStore';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { cargarHistoricoReal } from '../../utils/cargarHistoricoReal';
import { limpiarTodosLosDatos, limpiarCampanas, limpiarHistorico } from '../../utils/limpiarDatos';
import { useMenuActions } from '../../store/useMenuActions';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmacionCritica from './ConfirmacionCritica';
import { Target, CheckCircle, Clock, Send, Users, MousePointer, FileText, DollarSign, Car, Flag, BarChart3 } from 'lucide-react';

type FiltroDashboard = 'todas' | 'activas' | 'archivadas' | 'pendientes';

export default function Dashboard() {
  const { campanas, historico } = useCampanaStore();
  const { user, login } = useAuth();
  const [filtroActivo, setFiltroActivo] = useState<FiltroDashboard>('todas');
  const { setAcciones } = useMenuActions();
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [accionCritica, setAccionCritica] = useState<(() => void) | null>(null);
  const [descripcionCritica, setDescripcionCritica] = useState('');
  const [tituloCritica, setTituloCritica] = useState('');
  const [verificandoPassword, setVerificandoPassword] = useState(false);
  
  const esAdmin = user?.rol === 'Admin';

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
    }
  };

  // Función para confirmar acciones críticas con contraseña (solo Admin)
  const confirmarAccionCritica = async (password: string): Promise<void> => {
    if (!user?.username) {
      throw new Error('No se pudo obtener el usuario actual');
    }
    const resultado = await login(user.username, password);
    if (!resultado.success) {
      throw new Error('Contraseña incorrecta');
    }
  };

  const manejarLimpiarTodo = async () => {
    // Mostrar confirmación crítica
    setTituloCritica('Limpiar Todo el Sistema');
    setDescripcionCritica(
      `¿Estás SEGURO de que quieres eliminar TODOS los datos?\n\n` +
      `Esto eliminará:\n` +
      `• Todas las campañas\n` +
      `• Todo el histórico\n` +
      `• Todos los datos guardados\n\n` +
      `⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER ⚠️`
    );
    setAccionCritica(async () => {
      try {
        const resultado = limpiarTodosLosDatos();
        if (resultado.exito) {
          alert(`✅ ${resultado.mensaje}`);
          window.location.reload();
        } else {
          alert(`❌ ${resultado.mensaje}`);
        }
      } catch (error) {
        alert(`❌ Error limpiando datos: ${error}`);
      }
    });
    setMostrarConfirmacion(true);
  };

  const manejarLimpiarCampanas = async () => {
    setTituloCritica('Limpiar Campañas');
    setDescripcionCritica(
      `¿Estás SEGURO de que quieres eliminar todas las campañas?\n\n` +
      `Esto eliminará:\n` +
      `• Todas las campañas activas\n` +
      `• Todas las campañas pendientes\n` +
      `• Datos de métricas guardados\n\n` +
      `El histórico se mantendrá intacto.\n\n` +
      `⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER ⚠️`
    );
    setAccionCritica(async () => {
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
    });
    setMostrarConfirmacion(true);
  };

  const manejarLimpiarHistorico = async () => {
    setTituloCritica('Limpiar Histórico');
    setDescripcionCritica(
      `¿Estás SEGURO de que quieres eliminar todo el histórico?\n\n` +
      `Esto eliminará:\n` +
      `• Todas las campañas archivadas\n` +
      `• Métricas históricas\n` +
      `• Datos de evolución semanal\n\n` +
      `Las campañas activas se mantendrán intactas.\n\n` +
      `⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER ⚠️`
    );
    setAccionCritica(async () => {
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
    });
    setMostrarConfirmacion(true);
  };

  // Configurar acciones del menú contextual
  useEffect(() => {
    // Solo agregar acciones críticas si es Admin
    const acciones = esAdmin ? [
      {
        id: 'limpiar-todo',
        label: 'Limpiar Todo',
        icono: '🗑️',
        onClick: manejarLimpiarTodo,
        color: 'Rojo',
        peligroso: true
      },
      {
        id: 'limpiar-campanas',
        label: 'Limpiar Campañas',
        icono: '🎯',
        onClick: manejarLimpiarCampanas,
        color: 'Naranja',
        peligroso: true
      },
      {
        id: 'limpiar-historico',
        label: 'Limpiar Histórico',
        icono: '📊',
        onClick: manejarLimpiarHistorico,
        color: 'Gris',
        peligroso: true
      },
      {
        id: 'limpiar-storage',
        label: 'Limpiar Storage',
        icono: '🚨',
        onClick: () => {
          setTituloCritica('Limpiar Storage');
          setDescripcionCritica(
            `⚠️ ¿Limpiar completamente el localStorage?\n\n` +
            `Esto eliminará TODOS los datos guardados en el navegador.\n\n` +
            `⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER ⚠️`
          );
          setAccionCritica(async () => {
            localStorage.clear();
            alert('✅ localStorage limpiado. Recargando página...');
            window.location.reload();
          });
          setMostrarConfirmacion(true);
        },
        color: 'Rojo Oscuro',
        peligroso: true
      }
    ] : [];

    setAcciones(acciones);
  }, [setAcciones, esAdmin]);

  const tarjetas = [
    { titulo: 'Total Campañas', valor: estadisticas.total, Icon: Target, color: 'bg-blue-500' },
    { titulo: 'Activas', valor: estadisticas.activas, Icon: CheckCircle, color: 'bg-green-500' },
    { titulo: 'Pendientes', valor: estadisticas.pendientes, Icon: Clock, color: 'bg-yellow-500' },
    { titulo: 'Creativo Enviado', valor: estadisticas.creativoEnviado, Icon: Send, color: 'bg-blue-400' },
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
    <div className="space-y-6">
      <div>
        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFiltroActivo('todas')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center gap-2 ${
              filtroActivo === 'todas'
                ? 'text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
            }`}
            style={filtroActivo === 'todas' ? { background: 'linear-gradient(to right, #ef0000, #dc0000)' } : {}}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Todas ({campanas.length})</span>
          </button>
          <button
            onClick={() => setFiltroActivo('activas')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center gap-2 ${
              filtroActivo === 'activas'
                ? 'text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
            }`}
            style={filtroActivo === 'activas' ? { background: 'linear-gradient(to right, #ef0000, #dc0000)' } : {}}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Activas ({estadisticas.activas})</span>
          </button>
          <button
            onClick={() => setFiltroActivo('pendientes')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center gap-2 ${
              filtroActivo === 'pendientes'
                ? 'text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
            }`}
            style={filtroActivo === 'pendientes' ? { background: 'linear-gradient(to right, #ef0000, #dc0000)' } : {}}
          >
            <Clock className="w-4 h-4" />
            <span>Pendientes ({estadisticas.pendientes + estadisticas.creativoEnviado})</span>
          </button>
          <button
            onClick={() => setFiltroActivo('archivadas')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center gap-2 ${
              filtroActivo === 'archivadas'
                ? 'text-white shadow-lg transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-lg'
            }`}
            style={filtroActivo === 'archivadas' ? { background: 'linear-gradient(to right, #ef0000, #dc0000)' } : {}}
          >
            <FileText className="w-4 h-4" />
            <span>Archivadas ({estadisticas.archivadas})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tarjetas.map((tarjeta, index) => {
          const Icon = tarjeta.Icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{tarjeta.titulo}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-3">{tarjeta.valor}</p>
                </div>
                <div className={`${tarjeta.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Métricas {filtroActivo === 'todas' ? 'Generales' : filtroActivo === 'activas' ? 'Campañas Activas' : filtroActivo === 'archivadas' ? 'Campañas Archivadas' : 'Campañas Pendientes'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metricasTarjetas.map((tarjeta, index) => {
            const Icon = tarjeta.Icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-200 transform hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4">
                  <div className={`${tarjeta.color} w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{tarjeta.titulo}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1 truncate">{tarjeta.valor}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evolución Semanal */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Evolución Semanal (Últimas 4 Semanas)</h3>
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {evolucionSemanal.map((semana, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-slate-200">
                  <h4 className="font-bold text-gray-900 mb-2">Sem {semana.numeroSemana}</h4>
                  <p className="text-sm text-gray-600 mb-4 font-medium">{semana.semana}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Leads:</span>
                      <span className="font-semibold text-blue-600">{semana.leads.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-semibold text-green-600">${semana.costo.toFixed(0)} USD</span>
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
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-gray-200">
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
                          ${campana.costoLead?.toFixed(2)} USD
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

      {/* Modal de confirmación crítica */}
      {mostrarConfirmacion && (
        <ConfirmacionCritica
          titulo={tituloCritica}
          descripcion={descripcionCritica}
          onConfirmar={async (password: string) => {
            setVerificandoPassword(true);
            try {
              await confirmarAccionCritica(password);
              if (accionCritica) {
                await accionCritica();
              }
              setMostrarConfirmacion(false);
            } catch (err) {
              console.error('Error verificando contraseña:', err);
              throw err;
            } finally {
              setVerificandoPassword(false);
            }
          }}
          onCancelar={() => setMostrarConfirmacion(false)}
          isLoading={verificandoPassword}
        />
      )}
    </div>
  );
}

