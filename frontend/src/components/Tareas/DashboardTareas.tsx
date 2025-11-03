import { useState, useEffect } from 'react';
import { TareaPendiente, TipoTarea } from '../../types/campana';
import { tareaService } from '../../services/tareaService';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardTareasProps {
  onTareaClick?: (tarea: TareaPendiente) => void;
}

export default function DashboardTareas({ onTareaClick }: DashboardTareasProps) {
  const { user } = useAuth();
  const [tareas, setTareas] = useState<TareaPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setTareas(tareasData);
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
    } catch (err) {
      console.error('Error completando tarea:', err);
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

                <button
                  onClick={() => handleCompletarTarea(tarea)}
                  className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Completar
                </button>
              </div>
            </div>
          ))}
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

