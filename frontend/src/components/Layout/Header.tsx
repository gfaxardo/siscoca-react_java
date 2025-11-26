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
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <MenuContextual vistaActiva={vistaActiva} acciones={acciones} />
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          {onAbrirInbox && (
            <button
              onClick={onAbrirInbox}
              className="relative p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              title="Inbox de mensajes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {mensajesNoLeidos > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#ef0000' }}>
                  {mensajesNoLeidos > 9 ? '9+' : mensajesNoLeidos}
                </span>
              )}
            </button>
          )}

          {onAbrirTareas && (
            <button
              onClick={onAbrirTareas}
              className="p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
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
              className="px-4 py-2.5 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}
          
          {/* Información del usuario */}
          <div className="flex items-center space-x-3 relative ml-2 pl-2 lg:pl-3 border-l border-white/20">
            <div className="text-right hidden lg:block">
              <div className="text-sm font-semibold text-white">{user?.nombre}</div>
              <div className="text-xs text-gray-400">{user?.rol}</div>
            </div>
            <div className="relative">
              <button
                onClick={() => setMostrarMenuUsuario(!mostrarMenuUsuario)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110"
                style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
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
                  <div className="absolute right-0 mt-3 w-52 bg-slate-800 rounded-xl shadow-2xl border border-white/20 z-20 overflow-hidden backdrop-blur-xl">
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white">{user?.nombre}</p>
                        <p className="text-xs text-gray-400">{user?.rol}</p>
                      </div>
                      <button
                        onClick={() => {
                          setMostrarCambioContrasena(true);
                          setMostrarMenuUsuario(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 flex items-center space-x-3 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Cambiar Contraseña</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setMostrarMenuUsuario(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 flex items-center space-x-3 transition-colors border-t border-white/10"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
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


