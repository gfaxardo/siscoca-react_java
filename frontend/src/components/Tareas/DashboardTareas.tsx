import { useState, useEffect } from 'react';
import { TareaPendiente, TipoTarea } from '../../types/campana';
import { tareaService } from '../../services/tareaService';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardTareasProps {
  onTareaClick?: (tarea: TareaPendiente) => void;
}

interface Usuario {
  id: string;
  username: string;
  nombre: string;
  iniciales?: string;
  rol: string;
}

export default function DashboardTareas({ }: DashboardTareasProps) {
  const { user } = useAuth();
  const [tareas, setTareas] = useState<TareaPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostrarModalDerivar, setMostrarModalDerivar] = useState(false);
  const [tareaParaDerivar, setTareaParaDerivar] = useState<TareaPendiente | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<string>('');

  useEffect(() => {
    cargarTareas();
  }, [user?.rol]);

  const cargarTareas = async () => {
    try {
      setLoading(true);
      // Si es admin, cargar todas las tareas; si no, solo las del usuario
      const tareasData = user?.rol === 'Admin' 
        ? await tareaService.getAllTareasPendientes()
        : await tareaService.getTareasPendientes();
      // Filtrar solo tareas pendientes (completada = false) para asegurar que no se muestren completadas
      const tareasPendientes = tareasData.filter(t => !t.completada);
      setTareas(tareasPendientes);
    } catch (err) {
      setError('Error cargando tareas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletarTarea = async (tarea: TareaPendiente) => {
    try {
      await tareaService.completarTarea(tarea.id);
      cargarTareas(); // Recargar lista
      alert('✅ Tarea completada exitosamente');
    } catch (err) {
      console.error('Error completando tarea:', err);
      alert('❌ Error al completar la tarea');
    }
  };

  const handleCerrarTarea = async (tarea: TareaPendiente) => {
    if (!confirm(`¿Estás seguro de que quieres cerrar esta tarea?\n\n${tarea.tipoTarea}: ${tarea.descripcion}`)) {
      return;
    }
    try {
      await tareaService.completarTarea(tarea.id);
      cargarTareas();
      alert('✅ Tarea cerrada exitosamente');
    } catch (err) {
      console.error('Error cerrando tarea:', err);
      alert('❌ Error al cerrar la tarea');
    }
  };

  const handleAbrirModalDerivar = async (tarea: TareaPendiente) => {
    setTareaParaDerivar(tarea);
    setUsuarioSeleccionado('');
    setMostrarModalDerivar(true);
    
    // Cargar usuarios disponibles
    try {
      setCargandoUsuarios(true);
      const usuariosData = await tareaService.obtenerUsuarios();
      setUsuarios(usuariosData);
    } catch (err) {
      console.error('Error cargando usuarios:', err);
      alert('❌ Error al cargar usuarios disponibles');
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const handleDerivarTarea = async () => {
    if (!tareaParaDerivar || !usuarioSeleccionado) {
      alert('❌ Selecciona un usuario para derivar la tarea');
      return;
    }

    try {
      await tareaService.derivarTarea(tareaParaDerivar.id, usuarioSeleccionado);
      alert('✅ Tarea derivada exitosamente');
      setMostrarModalDerivar(false);
      setTareaParaDerivar(null);
      setUsuarioSeleccionado('');
      cargarTareas();
    } catch (err) {
      console.error('Error derivando tarea:', err);
      alert(`❌ Error al derivar la tarea: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const getIconoTarea = (tipo: TipoTarea) => {
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

  const getColorUrgente = (urgente: boolean) => {
    return urgente ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            📋 {user?.rol === 'Admin' ? 'Todas las Tareas Pendientes' : 'Mis Tareas Pendientes'}
          </h2>
          {user && (
            <span className="text-sm text-gray-600">
              {user.nombre}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {tareas.length} {tareas.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}
        </p>
      </div>

      {tareas.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-gray-600 font-medium">
            ¡No tienes tareas pendientes!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Sigue así, estás al día con todo.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {tareas.map((tarea) => (
            <div
              key={tarea.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${getColorUrgente(tarea.urgente)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getIconoTarea(tarea.tipoTarea)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {tarea.tipoTarea}
                      </h3>
                      {tarea.urgente && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                          URGENTE
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {tarea.descripcion}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      📌 Campaña: <strong>{tarea.campanaNombre}</strong>
                    </span>
                    <span>
                      🏷️ {tarea.responsableRol}
                    </span>
                    {user?.rol === 'Admin' && (
                      <span>
                        👤 Asignado a: <strong>{tarea.asignadoA}</strong>
                      </span>
                    )}
                    <span>
                      📅 {new Date(tarea.fechaCreacion).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex gap-2">
                  {(user?.rol === 'Admin' || tarea.asignadoA === user?.nombre) && (
                    <button
                      onClick={() => handleAbrirModalDerivar(tarea)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                      title="Derivar tarea a otro usuario"
                    >
                      ➡️ Derivar
                    </button>
                  )}
                  <button
                    onClick={() => handleCompletarTarea(tarea)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    title="Marcar como completada"
                  >
                    ✅ Completar
                  </button>
                  <button
                    onClick={() => handleCerrarTarea(tarea)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                    title="Cerrar tarea"
                  >
                    🔒 Cerrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para derivar tarea */}
      {mostrarModalDerivar && tareaParaDerivar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                ➡️ Derivar Tarea
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Tarea:</strong> {tareaParaDerivar.tipoTarea}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Descripción:</strong> {tareaParaDerivar.descripcion}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Asignado actualmente a:</strong> {tareaParaDerivar.asignadoA}
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Seleccionar usuario destino:
                </label>
                {cargandoUsuarios ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Cargando usuarios...</p>
                  </div>
                ) : (
                  <select
                    value={usuarioSeleccionado}
                    onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">-- Selecciona un usuario --</option>
                    {usuarios
                      .filter(u => u.nombre !== tareaParaDerivar.asignadoA)
                      .map((usuario) => (
                        <option key={usuario.id} value={usuario.nombre}>
                          {usuario.nombre} ({usuario.rol})
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setMostrarModalDerivar(false);
                    setTareaParaDerivar(null);
                    setUsuarioSeleccionado('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDerivarTarea}
                  disabled={!usuarioSeleccionado || cargandoUsuarios}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Derivar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={cargarTareas}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          🔄 Actualizar lista
        </button>
      </div>
    </div>
  );
}

