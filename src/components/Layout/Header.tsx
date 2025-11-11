import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import MenuContextual from './MenuContextual';
import { useMenuActions } from '../../store/useMenuActions';
import CambiarContrasena from '../Auth/CambiarContrasena';

interface HeaderProps {
  onAbrirDashboard?: () => void;
  onAbrirTareas?: () => void;
  onAbrirInbox?: () => void;
  vistaActiva?: string;
  onCambiarVista?: (vista: string) => void;
}

export default function Header({ onAbrirDashboard, onAbrirTareas, onAbrirInbox, vistaActiva, onCambiarVista }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [mostrarCambioContrasena, setMostrarCambioContrasena] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);
  const { acciones } = useMenuActions();

  useEffect(() => {
    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const cargarMensajes = async () => {
      if (!isMounted) return;
      await cargarMensajesNoLeidos();
    };

    cargarMensajes();
    // Aumentar intervalo a 60 segundos para reducir carga del servidor
    intervalId = setInterval(cargarMensajes, 60000); // Actualizar cada 60 segundos
    
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [user?.rol]);

  const cargarMensajesNoLeidos = async () => {
    try {
      // Si es admin, cargar todos los mensajes; si no, solo los del usuario
      const total = user?.rol === 'Admin' 
        ? await chatService.getAllMensajesNoLeidos()
        : await chatService.getMensajesNoLeidos();
      setMensajesNoLeidos(total);
    } catch (err) {
      console.error('Error cargando mensajes no leídos:', err);
    }
  };
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 lg:px-6 lg:py-3">
        <div className="flex items-center space-x-2 lg:space-x-4">
          <MenuContextual vistaActiva={vistaActiva} acciones={acciones} />
          {onCambiarVista && vistaActiva && (
            <div className="flex items-center space-x-1 border-l border-gray-300 pl-2 lg:pl-4 ml-2 lg:ml-4">
              <button
                onClick={() => onCambiarVista('dashboard')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  vistaActiva === 'dashboard'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Dashboard
              </button>
              <button
                onClick={() => onCambiarVista('campanas')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  vistaActiva === 'campanas'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎯 Campañas
              </button>
              <button
                onClick={() => onCambiarVista('historico')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  vistaActiva === 'historico'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📈 Histórico
              </button>
              <button
                onClick={() => onCambiarVista('auditoria')}
                className={`px-2 py-1 text-xs font-medium transition-colors ${
                  vistaActiva === 'auditoria'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 Auditoría
              </button>
              {user?.rol === 'Admin' && (
                <button
                  onClick={() => onCambiarVista('administracion')}
                  className={`px-2 py-1 text-xs font-medium transition-colors ${
                    vistaActiva === 'administracion'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  ⚙️ Administración
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-4">
          {onAbrirInbox && (
            <button
              onClick={onAbrirInbox}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Inbox de mensajes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {mensajesNoLeidos > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {mensajesNoLeidos > 9 ? '9+' : mensajesNoLeidos}
                </span>
              )}
            </button>
          )}

          {onAbrirTareas && (
            <button
              onClick={onAbrirTareas}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Tareas pendientes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </button>
          )}

          {onAbrirDashboard && (
            <button
              onClick={onAbrirDashboard}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1.5 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}
          
          {/* Información del usuario */}
          <div className="flex items-center space-x-2 relative">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">{user?.nombre}</div>
              <div className="text-xs text-gray-500">{user?.rol}</div>
            </div>
            <div className="relative">
              <button
                onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
                className="w-8 h-8 lg:w-10 lg:h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:bg-primary-600 transition-colors cursor-pointer"
                title="Menú de usuario"
              >
                {user?.nombre?.charAt(0).toUpperCase() || 'U'}
              </button>
              
              {/* Menú desplegable */}
              {mostrarMenuUsuario && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setMostrarMenuUsuario(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setMostrarCambioContrasena(true);
                          setMostrarMenuUsuario(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>🔒</span>
                        <span>Cambiar Contraseña</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setMostrarMenuUsuario(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <span>🚪</span>
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de cambio de contraseña */}
      {mostrarCambioContrasena && (
        <CambiarContrasena onCerrar={() => setMostrarCambioContrasena(false)} />
      )}
    </header>
  );
}


