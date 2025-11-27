import { useState, useEffect, useRef } from 'react';
import { MensajeChat } from '../../types/campana';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';
import { MessageCircle, X, Send, AlertCircle, Loader2 } from 'lucide-react';

interface ChatCampanaProps {
  campanaId: string;
  campanaNombre: string;
  onClose?: () => void;
}

export default function ChatCampana({ campanaId, campanaNombre, onClose }: ChatCampanaProps) {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [urgente, setUrgente] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cargarMensajes();
    marcarComoLeidos();
    const interval = setInterval(cargarMensajes, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, [campanaId]);

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cargarMensajes = async () => {
    try {
      const mensajesData = await chatService.getMensajesPorCampana(campanaId);
      setMensajes(mensajesData);
      setLoading(false);
    } catch (err) {
      console.error('Error cargando mensajes:', err);
    }
  };

  const marcarComoLeidos = async () => {
    try {
      await chatService.marcarTodosComoLeidos(campanaId);
    } catch (err) {
      console.error('Error marcando como leídos:', err);
    }
  };

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim()) return;

    try {
      setEnviando(true);
      await chatService.enviarMensaje(campanaId, nuevoMensaje.trim(), urgente);
      setNuevoMensaje('');
      setUrgente(false);
      cargarMensajes();
    } catch (err) {
      console.error('Error enviando mensaje:', err);
      alert('Error enviando mensaje');
    } finally {
      setEnviando(false);
    }
  };

  const isMiMensaje = (remitente: string) => {
    return user && (user.nombre === remitente || user.username === remitente);
  };

  const formatearFecha = (fecha: Date) => {
    const hoy = new Date();
    const fechaMensaje = new Date(fecha);
    
    const esHoy = fechaMensaje.toDateString() === hoy.toDateString();
    
    if (esHoy) {
      return fechaMensaje.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return fechaMensaje.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header moderno */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">
                Chat de Campaña
              </h2>
              <p className="text-gray-400 text-sm truncate max-w-xs lg:max-w-md">
                {campanaNombre}
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              title="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 bg-gradient-to-br from-gray-50 to-gray-100">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-primary-500 mb-3"></div>
            <p className="text-gray-600 text-sm font-medium">Cargando mensajes...</p>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <p className="text-lg font-bold text-gray-900">No hay mensajes</p>
            <p className="text-sm text-gray-600">Sé el primero en escribir</p>
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${isMiMensaje(mensaje.remitente) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-sm ${
                  isMiMensaje(mensaje.remitente)
                    ? 'text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
                style={isMiMensaje(mensaje.remitente) ? { background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' } : {}}
              >
                {!isMiMensaje(mensaje.remitente) && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-gray-900">{mensaje.remitente}</span>
                    {mensaje.urgente && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1" style={{ background: '#ef0000', color: 'white' }}>
                        <AlertCircle className="w-3 h-3" />
                        URGENTE
                      </span>
                    )}
                  </div>
                )}
                {isMiMensaje(mensaje.remitente) && mensaje.urgente && (
                  <div className="flex items-center gap-1 mb-2">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-xs font-bold">URGENTE</span>
                  </div>
                )}
                <p className="text-sm break-words font-medium">{mensaje.mensaje}</p>
                <p className={`text-xs mt-2 font-medium ${isMiMensaje(mensaje.remitente) ? 'text-white/80' : 'text-gray-500'}`}>
                  {formatearFecha(mensaje.fechaCreacion)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={handleEnviarMensaje} className="p-4 lg:p-6 border-t border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-medium text-sm hover:border-gray-400 transition-all"
              rows={2}
              disabled={enviando}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEnviarMensaje(e);
                }
              }}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-red-50 transition-colors">
              <input
                type="checkbox"
                checked={urgente}
                onChange={(e) => setUrgente(e.target.checked)}
                className="w-4 h-4 rounded focus:ring-2 focus:ring-primary-500"
                style={{ accentColor: '#ef0000' }}
              />
              <span className="text-xs font-bold flex items-center gap-1" style={{ color: '#ef0000' }}>
                <AlertCircle className="w-3 h-3" />
                Urgente
              </span>
            </label>
            
            <button
              type="submit"
              disabled={!nuevoMensaje.trim() || enviando}
              className="px-6 py-3 text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none flex items-center justify-center gap-2"
              style={{ background: (!nuevoMensaje.trim() || enviando) ? '#9ca3af' : 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              {enviando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-medium">
          Presiona <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">Enter</kbd> para enviar o <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded text-gray-700 font-mono">Shift+Enter</kbd> para nueva línea
        </p>
      </form>
    </div>
  );
}







