import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { chatService } from '../../services/chatService';
import CambiarContrasena from '../Auth/CambiarContrasena';
import { Mail, ClipboardList, Lock, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  onAbrirTareas?: () => void;
  onAbrirInbox?: () => void;
  vistaActiva?: string;
  onCambiarVista?: (vista: string) => void;
  onToggleSidebar?: () => void;
}

export default function Header({ onAbrirTareas, onAbrirInbox, onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [mostrarCambioContrasena, setMostrarCambioContrasena] = useState(false);
  const [mostrarMenuUsuario, setMostrarMenuUsuario] = useState(false);

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
          {/* Botón hamburguesa para móviles */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              title="Menú"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3">
          {onAbrirInbox && (
            <button
              onClick={onAbrirInbox}
              className="relative p-2.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              title="Inbox de mensajes"
            >
              <Mail className="w-5 h-5" />
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
              <ClipboardList className="w-5 h-5" />
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
                        <Lock className="w-5 h-5" />
                        <span>Cambiar Contraseña</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setMostrarMenuUsuario(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 flex items-center space-x-3 transition-colors border-t border-white/10"
                      >
                        <LogOut className="w-5 h-5" />
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


