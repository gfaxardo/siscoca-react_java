import { useState, useRef, useEffect } from 'react';
import { Campana } from '../../types';

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
    const acciones = [];

    // Acciones según el estado de la campaña
    switch (campana.estado) {
      case 'Pendiente':
        acciones.push({
          id: 'enviar-creativo',
          label: '📎 Enviar Creativo',
          onClick: onEnviarCreativo,
          color: 'text-blue-600 hover:bg-blue-50'
        });
        break;

      case 'Creativo Enviado':
        acciones.push({
          id: 'activar-campana',
          label: '✅ Activar Campaña',
          onClick: onActivarCampana,
          color: 'text-green-600 hover:bg-green-50'
        });
        
        if (campana.archivoCreativo) {
          acciones.push({
            id: 'descargar-creativo',
            label: '⬇️ Descargar Creativo',
            onClick: onDescargarCreativo,
            color: 'text-purple-600 hover:bg-purple-50'
          });
        }
        break;

      case 'Activa':
        acciones.push({
          id: 'subir-metricas-trafficker',
          label: '📊 Subir Métricas Trafficker',
          onClick: onSubirMetricasTrafficker,
          color: 'text-primary-600 hover:bg-primary-50'
        });
        
        acciones.push({
          id: 'subir-metricas-dueno',
          label: '👥 Subir Métricas Dueño',
          onClick: onSubirMetricasDueno,
          color: 'text-orange-600 hover:bg-orange-50'
        });

        // Mostrar descargar creativo si existe
        if (campana.archivoCreativo) {
          acciones.push({
            id: 'descargar-creativo',
            label: '⬇️ Descargar Creativo',
            onClick: onDescargarCreativo,
            color: 'text-purple-600 hover:bg-purple-50'
          });
        }

        // Solo mostrar archivar si tiene métricas del trafficker Y del dueño
        if (campana.alcance && campana.conductoresRegistrados !== undefined) {
          acciones.push({
            id: 'archivar-campana',
            label: '📁 Archivar Campaña',
            onClick: onArchivarCampana,
            color: 'text-indigo-600 hover:bg-indigo-50'
          });
        }

        break;

      case 'Archivada':
        // Opción de reactivar para campañas archivadas
        if (onReactivarCampana) {
          acciones.push({
            id: 'reactivar-campana',
            label: '♻️ Reactivar Campaña',
            onClick: onReactivarCampana,
            color: 'text-green-600 hover:bg-green-50'
          });
        }
        
        // Descargar creativo si existe
        if (campana.archivoCreativo) {
          acciones.push({
            id: 'descargar-creativo',
            label: '⬇️ Descargar Creativo',
            onClick: onDescargarCreativo,
            color: 'text-purple-600 hover:bg-purple-50'
          });
        }
        break;
    }

    // Acción de métricas globales siempre disponible (excepto para archivadas que no tienen todas las métricas)
    if (campana.estado !== 'Archivada') {
      acciones.push({
        id: 'metricas-globales',
        label: '📊 Métricas Globales',
        onClick: onVerMetricasGlobales,
        color: 'text-green-600 hover:bg-green-50'
      });
    }

    // Acción de historial de cambios siempre disponible
    acciones.push({
      id: 'historial-cambios',
      label: '📋 Historial de Cambios',
      onClick: onVerHistorialCambios,
      color: 'text-indigo-600 hover:bg-indigo-50'
    });

    // Acción de editar siempre disponible
    acciones.push({
      id: 'editar-campana',
      label: '✏️ Editar Campaña',
      onClick: onEditarCampana,
      color: 'text-blue-600 hover:bg-blue-50'
    });

    // Acción de eliminar siempre disponible
    acciones.push({
      id: 'eliminar-campana',
      label: '🗑️ Eliminar Campaña',
      onClick: onEliminarCampana,
      color: 'text-red-600 hover:bg-red-50'
    });

    return acciones;
  };

  const acciones = obtenerAccionesDisponibles();

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón de 3 puntos */}
      <button
        onClick={() => setMenuAbierto(!menuAbierto)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Acciones de campaña"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {menuAbierto && (
        <div className="absolute right-0 top-10 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {acciones.map((accion) => (
            <button
              key={accion.id}
              onClick={() => {
                accion.onClick();
                setMenuAbierto(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm font-medium transition-colors ${accion.color}`}
            >
              {accion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
