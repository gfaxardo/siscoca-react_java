import { useState, useRef, useEffect } from 'react';
import { Campana } from '../../types';
import { 
  MoreVertical, 
  FileText, 
  CheckCircle, 
  Download, 
  BarChart3, 
  Users, 
  Archive, 
  RotateCcw, 
  TrendingUp, 
  History, 
  Eye, 
  Edit, 
  Trash2 
} from 'lucide-react';

interface MenuAccionesCampanaProps {
  campana: Campana;
  onEnviarCreativo: () => void;
  onActivarCampana: () => void;
  onSubirMetricasTrafficker: () => void;
  onSubirMetricasDueno: () => void;
  onArchivarCampana: () => void;
  onReactivarCampana?: () => void;
  onDescargarCreativo: () => void;
  onEliminarCampana: () => void;
  onEditarCampana: () => void;
  onVerDetalles?: () => void;
  onVerMetricasGlobales: () => void;
  onVerHistorialCambios: () => void;
}

export default function MenuAccionesCampana({
  campana,
  onEnviarCreativo,
  onActivarCampana,
  onSubirMetricasTrafficker,
  onSubirMetricasDueno,
  onArchivarCampana,
  onReactivarCampana,
  onDescargarCreativo,
  onEliminarCampana,
  onEditarCampana,
  onVerDetalles,
  onVerMetricasGlobales,
  onVerHistorialCambios
}: MenuAccionesCampanaProps) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAbierto(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const obtenerAccionesDisponibles = () => {
    const acciones: Array<{
      id: string;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      onClick: () => void;
      color: string;
    }> = [];

    // Acciones según el estado de la campaña
    switch (campana.estado) {
      case 'Pendiente':
        acciones.push({
          id: 'enviar-creativo',
          label: 'Gestionar Creativos',
          icon: FileText,
          onClick: onEnviarCreativo,
          color: 'text-blue-700 hover:bg-blue-50'
        });
        break;

      case 'Creativo Enviado':
        acciones.push({
          id: 'enviar-creativo',
          label: 'Gestionar Creativos',
          icon: FileText,
          onClick: onEnviarCreativo,
          color: 'text-blue-700 hover:bg-blue-50'
        });
        
        acciones.push({
          id: 'activar-campana',
          label: 'Activar Campaña',
          icon: CheckCircle,
          onClick: onActivarCampana,
          color: 'text-green-700 hover:bg-green-50'
        });
        
        if (campana.archivoCreativo) {
          acciones.push({
            id: 'descargar-creativo',
            label: 'Descargar Creativo',
            icon: Download,
            onClick: onDescargarCreativo,
            color: 'text-purple-700 hover:bg-purple-50'
          });
        }
        break;

      case 'Activa':
        // Opción para gestionar creativos (agregar, modificar, eliminar)
        acciones.push({
          id: 'enviar-creativo',
          label: 'Gestionar Creativos',
          icon: FileText,
          onClick: onEnviarCreativo,
          color: 'text-blue-700 hover:bg-blue-50'
        });
        
        acciones.push({
          id: 'subir-metricas-trafficker',
          label: 'Subir Métricas Trafficker',
          icon: BarChart3,
          onClick: onSubirMetricasTrafficker,
          color: 'text-gray-700 hover:bg-gray-50'
        });
        
        acciones.push({
          id: 'subir-metricas-dueno',
          label: 'Subir Métricas Dueño',
          icon: Users,
          onClick: onSubirMetricasDueno,
          color: 'text-orange-700 hover:bg-orange-50'
        });

        // Mostrar descargar creativo si existe (legacy)
        if (campana.archivoCreativo) {
          acciones.push({
            id: 'descargar-creativo',
            label: 'Descargar Creativo',
            icon: Download,
            onClick: onDescargarCreativo,
            color: 'text-purple-700 hover:bg-purple-50'
          });
        }

        // Solo mostrar archivar si tiene métricas del trafficker Y del dueño
        if (campana.alcance && campana.conductoresRegistrados !== undefined) {
          acciones.push({
            id: 'archivar-campana',
            label: 'Archivar Campaña',
            icon: Archive,
            onClick: onArchivarCampana,
            color: 'text-indigo-700 hover:bg-indigo-50'
          });
        }

        break;

      case 'Archivada':
        // Opción para gestionar creativos (solo lectura)
        acciones.push({
          id: 'enviar-creativo',
          label: 'Gestionar Creativos',
          icon: FileText,
          onClick: onEnviarCreativo,
          color: 'text-blue-700 hover:bg-blue-50'
        });
        
        // Opción de reactivar para campañas archivadas
        if (onReactivarCampana) {
          acciones.push({
            id: 'reactivar-campana',
            label: 'Reactivar Campaña',
            icon: RotateCcw,
            onClick: onReactivarCampana,
            color: 'text-green-700 hover:bg-green-50'
          });
        }
        
        // Descargar creativo si existe
        if (campana.archivoCreativo) {
          acciones.push({
            id: 'descargar-creativo',
            label: 'Descargar Creativo',
            icon: Download,
            onClick: onDescargarCreativo,
            color: 'text-purple-700 hover:bg-purple-50'
          });
        }
        break;
    }

    // Acción de métricas globales siempre disponible (excepto para archivadas que no tienen todas las métricas)
    if (campana.estado !== 'Archivada') {
      acciones.push({
        id: 'metricas-globales',
        label: 'Métricas Globales',
        icon: TrendingUp,
        onClick: onVerMetricasGlobales,
        color: 'text-green-700 hover:bg-green-50'
      });
    }

    // Acción de historial de cambios siempre disponible
    acciones.push({
      id: 'historial-cambios',
      label: 'Historial de Cambios',
      icon: History,
      onClick: onVerHistorialCambios,
      color: 'text-indigo-700 hover:bg-indigo-50'
    });

    // Acción de ver detalles siempre disponible
    if (onVerDetalles) {
      acciones.push({
        id: 'ver-detalles',
        label: 'Ver Detalles',
        icon: Eye,
        onClick: onVerDetalles,
        color: 'text-purple-700 hover:bg-purple-50'
      });
    }

    // Acción de editar siempre disponible
    acciones.push({
      id: 'editar-campana',
      label: 'Editar Campaña',
      icon: Edit,
      onClick: onEditarCampana,
      color: 'text-blue-700 hover:bg-blue-50'
    });

    // Acción de eliminar siempre disponible
    acciones.push({
      id: 'eliminar-campana',
      label: 'Eliminar Campaña',
      icon: Trash2,
      onClick: onEliminarCampana,
      color: 'text-red-700 hover:bg-red-50'
    });

    return acciones;
  };

  const acciones = obtenerAccionesDisponibles();

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón de 3 puntos */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMenuAbierto(!menuAbierto);
        }}
        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
        title="Acciones de campaña"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {/* Menú desplegable */}
      {menuAbierto && (
        <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn">
          {acciones.map((accion, index) => {
            const Icon = accion.icon;
            return (
              <button
                key={accion.id}
                onClick={(e) => {
                  e.stopPropagation();
                  accion.onClick();
                  setMenuAbierto(false);
                }}
                className={`w-full px-4 py-3 text-left text-sm font-bold transition-all duration-200 flex items-center gap-3 ${accion.color} ${
                  index !== acciones.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{accion.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
