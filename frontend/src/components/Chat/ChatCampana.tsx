import { useState, useEffect, useRef } from 'react';
import { MensajeChat } from '../../types/campana';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';

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
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-lg font-bold">
              💬 Chat: {campanaNombre}
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✖️
            </button>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : mensajes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium">No hay mensajes</p>
            <p className="text-sm">Sé el primero en escribir</p>
          </div>
        ) : (
          mensajes.map((mensaje) => (
            <div
              key={mensaje.id}
              className={`flex ${isMiMensaje(mensaje.remitente) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isMiMensaje(mensaje.remitente)
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {!isMiMensaje(mensaje.remitente) && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{mensaje.remitente}</span>
                    {mensaje.urgente && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                        URGENTE
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm break-words">{mensaje.mensaje}</p>
                <p className={`text-xs mt-1 ${isMiMensaje(mensaje.remitente) ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatearFecha(mensaje.fechaCreacion)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input de mensaje */}
      <form onSubmit={handleEnviarMensaje} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={enviando}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={urgente}
                onChange={(e) => setUrgente(e.target.checked)}
                className="rounded"
              />
              <span className="text-xs text-red-600 font-medium">⏹️ Urgente</span>
            </label>
            
            <button
              type="submit"
              disabled={!nuevoMensaje.trim() || enviando}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              {enviando ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}







