import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TareaPendiente, TipoTarea } from '../../types/campana';
import { tareaService } from '../../services/tareaService';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { 
  PlusCircle, 
  Paperclip, 
  CheckCircle, 
  BarChart3, 
  Users, 
  Archive, 
  ClipboardList, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Loader2,
  RefreshCw,
  PartyPopper,
  Flag,
  User,
  Calendar
} from 'lucide-react';

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
  // Hooks
  const notify = useNotification();
  const { user } = useAuth();
  
  // Estados
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
      notify.success(' Tarea completada exitosamente');
    } catch (err) {
      console.error('Error completando tarea:', err);
      notify.error(' Error al completar la tarea');
    }
  };

  const handleCerrarTarea = async (tarea: TareaPendiente) => {
    if (!confirm(`¿Estás seguro de que quieres cerrar esta tarea?\n\n${tarea.tipoTarea}: ${tarea.descripcion}`)) {
      return;
    }
    try {
      await tareaService.completarTarea(tarea.id);
      cargarTareas();
      notify.success(' Tarea cerrada exitosamente');
    } catch (err) {
      console.error('Error cerrando tarea:', err);
      notify.error(' Error al cerrar la tarea');
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
      notify.error(' Error al cargar usuarios disponibles');
    } finally {
      setCargandoUsuarios(false);
    }
  };

  const handleDerivarTarea = async () => {
    if (!tareaParaDerivar || !usuarioSeleccionado) {
      notify.error(' Selecciona un usuario para derivar la tarea');
      return;
    }

    try {
      await tareaService.derivarTarea(tareaParaDerivar.id, usuarioSeleccionado);
      notify.success(' Tarea derivada exitosamente');
      setMostrarModalDerivar(false);
      setTareaParaDerivar(null);
      setUsuarioSeleccionado('');
      cargarTareas();
    } catch (err) {
      console.error('Error derivando tarea:', err);
      notify.error(` Error al derivar la tarea: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const getIconoTarea = (tipo: TipoTarea) => {
    const iconClass = "w-5 h-5";
    switch (tipo) {
      case 'Crear Campaña':
        return <PlusCircle className={iconClass} style={{ color: '#ef0000' }} />;
      case 'Enviar Creativo':
        return <Paperclip className={iconClass} style={{ color: '#2563eb' }} />;
      case 'Activar Campaña':
        return <CheckCircle className={iconClass} style={{ color: '#16a34a' }} />;
      case 'Subir Métricas Trafficker':
        return <BarChart3 className={iconClass} style={{ color: '#8b5cf6' }} />;
      case 'Subir Métricas Dueño':
        return <Users className={iconClass} style={{ color: '#f59e0b' }} />;
      case 'Archivar Campaña':
        return <Archive className={iconClass} style={{ color: '#6b7280' }} />;
      default:
        return <ClipboardList className={iconClass} style={{ color: '#ef0000' }} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <Loader2 className="w-10 h-10 animate-spin mb-4" style={{ color: '#ef0000' }} />
        <p className="text-lg font-bold text-gray-800">Cargando tareas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-600 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-900 font-bold text-base">Error al cargar tareas</p>
            <p className="text-red-800 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      {/* Header moderno */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user?.rol === 'Admin' ? 'Todas las Tareas Pendientes' : 'Mis Tareas Pendientes'}
              </h2>
              <p className="text-sm text-gray-600 font-medium">
                {tareas.length} {tareas.length === 1 ? 'tarea pendiente' : 'tareas pendientes'}
              </p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900 font-bold">
                {user.nombre}
              </span>
            </div>
          )}
        </div>
      </div>

      {tareas.length === 0 ? (
        <div className="p-12 text-center">
          <div 
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(to bottom right, #16a34a, #15803d)' }}
          >
            <PartyPopper className="w-12 h-12 text-white" />
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-3">
            ¡No tienes tareas pendientes!
          </p>
          <p className="text-base text-gray-600 font-medium">
            Sigue así, estás al día con todo.
          </p>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {tareas.map((tarea) => (
            <div
              key={tarea.id}
              className={`rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                tarea.urgente 
                  ? 'bg-red-50 border-red-300 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header de la tarea */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {getIconoTarea(tarea.tipoTarea)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base">
                          {tarea.tipoTarea}
                        </h3>
                      </div>
                      {tarea.urgente && (
                        <div className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shadow-md flex-shrink-0">
                          <AlertCircle className="w-3 h-3" />
                          URGENTE
                        </div>
                      )}
                    </div>

                    {/* Descripción */}
                    <p className="text-sm text-gray-700 mb-3 font-medium">
                      {tarea.descripcion}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-lg">
                        <Flag className="w-3.5 h-3.5 text-gray-600" />
                        <span className="text-gray-900 font-bold">{tarea.campanaNombre}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-100 px-3 py-1.5 rounded-lg">
                        <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-blue-900 font-bold">{tarea.responsableRol}</span>
                      </div>
                      {user?.rol === 'Admin' && (
                        <div className="flex items-center gap-1.5 bg-purple-100 px-3 py-1.5 rounded-lg">
                          <User className="w-3.5 h-3.5 text-purple-600" />
                          <span className="text-purple-900 font-bold">{tarea.asignadoA}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 bg-green-100 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-900 font-bold">
                          {new Date(tarea.fechaCreacion).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {(user?.rol === 'Admin' || tarea.asignadoA === user?.nombre) && (
                      <button
                        onClick={() => handleAbrirModalDerivar(tarea)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 shadow hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
                        title="Derivar tarea a otro usuario"
                      >
                        <ArrowRight className="w-4 h-4" />
                        Derivar
                      </button>
                    )}
                    <button
                      onClick={() => handleCompletarTarea(tarea)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-200 shadow hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
                      title="Marcar como completada"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Completar
                    </button>
                    <button
                      onClick={() => handleCerrarTarea(tarea)}
                      className="px-4 py-2 text-white font-bold rounded-xl transition-all duration-200 shadow hover:shadow-md transform hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap"
                      style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                      title="Cerrar tarea"
                    >
                      <X className="w-4 h-4" />
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para derivar tarea */}
      {mostrarModalDerivar && tareaParaDerivar && createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header moderno */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-6 py-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
                  >
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Derivar Tarea
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Asignar a otro usuario
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMostrarModalDerivar(false);
                    setTareaParaDerivar(null);
                    setUsuarioSeleccionado('');
                  }}
                  className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  aria-label="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Información de la tarea */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-5 border border-gray-200 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-1">Tarea:</p>
                  <p className="text-sm text-gray-900 font-bold">{tareaParaDerivar.tipoTarea}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-1">Descripción:</p>
                  <p className="text-sm text-gray-900 font-medium">{tareaParaDerivar.descripcion}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-bold mb-1">Asignado actualmente a:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-900 font-bold bg-purple-100 px-3 py-1 rounded-lg">
                      {tareaParaDerivar.asignadoA}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selector de usuario */}
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                  Seleccionar usuario destino:
                </label>
                {cargandoUsuarios ? (
                  <div className="text-center py-6">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#ef0000' }} />
                    <p className="text-sm text-gray-600 font-medium">Cargando usuarios...</p>
                  </div>
                ) : (
                  <select
                    value={usuarioSeleccionado}
                    onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white hover:border-gray-400 font-medium text-sm"
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

              {/* Botones */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setMostrarModalDerivar(false);
                    setTareaParaDerivar(null);
                    setUsuarioSeleccionado('');
                  }}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 shadow hover:shadow-md flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleDerivarTarea}
                  disabled={!usuarioSeleccionado || cargandoUsuarios}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  Derivar Tarea
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Footer con botón de actualizar */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <button
          onClick={cargarTareas}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Actualizar Lista de Tareas
        </button>
      </div>
    </div>
  );
}

