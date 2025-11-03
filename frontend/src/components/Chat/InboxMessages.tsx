import { useState, useEffect } from 'react';
import { MensajeChat } from '../../types/campana';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../contexts/AuthContext';

interface InboxMessagesProps {
  onMensajeClick?: (campanaId: string) => void;
}

export default function InboxMessages({ onMensajeClick }: InboxMessagesProps) {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [totalNoLeidos, setTotalNoLeidos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarMensajes();
    const interval = setInterval(cargarMensajes, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, [user?.rol]);

  const cargarMensajes = async () => {
    try {
      // Si es admin, cargar todos los mensajes; si no, solo los del usuario
      const [mensajesData, totalData] = user?.rol === 'Admin'
        ? await Promise.all([
            chatService.getAllListaMensajesNoLeidos(),
            chatService.getAllMensajesNoLeidos()
          ])
        : await Promise.all([
            chatService.getListaMensajesNoLeidos(),
            chatService.getMensajesNoLeidos()
          ]);
      
      setMensajes(mensajesData);
      setTotalNoLeidos(totalData);
    } catch (err) {
      setError('Error cargando mensajes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const agruparPorCampaña = (mensajes: MensajeChat[]): Map<string, MensajeChat[]> => {
    const grouped = new Map<string, MensajeChat[]>();
    
    mensajes.forEach(mensaje => {
      if (!grouped.has(mensaje.campanaId)) {
        grouped.set(mensaje.campanaId, []);
      }
      grouped.get(mensaje.campanaId)!.push(mensaje);
    });
    
    return grouped;
  };

  const handleClickCampaña = (campanaId: string) => {
    if (onMensajeClick) {
      onMensajeClick(campanaId);
    }
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

  const mensajesPorCampaña = agruparPorCampaña(mensajes);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            📨 Inbox
          </h2>
          {totalNoLeidos > 0 && (
            <span className="px-3 py-1 bg-red-600 text-white text-sm font-bold rounded-full">
              {totalNoLeidos}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Mensajes sin leer
        </p>
      </div>

      {mensajesPorCampaña.size === 0 ? (
        <div className="p-8 text-center">
          <div className="text-6xl mb-4">📬</div>
          <p className="text-gray-600 font-medium">
            No tienes mensajes sin leer
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Estás al día con todas las conversaciones
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {Array.from(mensajesPorCampaña.entries()).map(([campanaId, mensajesCampaña]) => {
            const ultimoMensaje = mensajesCampaña[mensajesCampaña.length - 1];
            const cantidadNoLeidos = mensajesCampaña.filter(m => !m.leido).length;
            
            return (
              <button
                key={campanaId}
                onClick={() => handleClickCampaña(campanaId)}
                className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-800">
                        {ultimoMensaje.campanaNombre}
                      </h3>
                      {ultimoMensaje.urgente && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                          URGENTE
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {ultimoMensaje.mensaje}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>
                        👤 {ultimoMensaje.remitente}
                      </span>
                      <span>
                        📅 {new Date(ultimoMensaje.fechaCreacion).toLocaleDateString('es-ES')}
                      </span>
                      <span>
                        🕐 {new Date(ultimoMensaje.fechaCreacion).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {cantidadNoLeidos > 0 && (
                    <div className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                      {cantidadNoLeidos}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={cargarMensajes}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
}

