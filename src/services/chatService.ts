import { MensajeChat } from '../types/campana';

import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

class ChatService {
  private getAuthHeaders(): HeadersInit {
    let token: string | null = null;
    
    // 1. Intentar obtener desde 'siscoca_user' (formato principal)
    const userStr = localStorage.getItem('siscoca_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        token = user?.token || null;
        
        // Verificar que el token no esté vacío
        if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
          token = null;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    
    // 2. Si no hay token, intentar obtenerlo directamente del localStorage
    if (!token) {
      token = localStorage.getItem('token') || localStorage.getItem('siscoca_token');
      
      // Verificar que el token no sea inválido
      if (token && (token === 'null' || token === 'undefined' || token.trim() === '')) {
        token = null;
      }
    }
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    // Solo agregar Authorization si hay un token válido
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async getMensajesPorCampana(campanaId: string): Promise<MensajeChat[]> {
    try {
      const response = await fetch(`${API_URL}/chat/campana/${campanaId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo mensajes');
      }

      const data = await response.json();
      return this.convertirApiAMensajes(data);
    } catch (error) {
      console.error('Error en getMensajesPorCampana:', error);
      throw error;
    }
  }

  async enviarMensaje(campanaId: string, mensaje: string, urgente: boolean = false): Promise<MensajeChat> {
    try {
      const response = await fetch(`${API_URL}/chat/enviar`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          campanaId: parseInt(campanaId),
          mensaje,
          urgente
        })
      });

      if (!response.ok) {
        throw new Error('Error enviando mensaje');
      }

      const data = await response.json();
      return this.convertirApiAMensajes([data])[0];
    } catch (error) {
      console.error('Error en enviarMensaje:', error);
      throw error;
    }
  }

  async marcarMensajeComoLeido(mensajeId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/chat/mensaje/${mensajeId}/leer`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error marcando mensaje como leído');
      }
    } catch (error) {
      console.error('Error en marcarMensajeComoLeido:', error);
      throw error;
    }
  }

  async marcarTodosComoLeidos(campanaId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/chat/campana/${campanaId}/marcar-leidos`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error marcando mensajes como leídos');
      }
    } catch (error) {
      console.error('Error en marcarTodosComoLeidos:', error);
      throw error;
    }
  }

  async getMensajesNoLeidos(): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/chat/no-leidos`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo mensajes no leídos');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getMensajesNoLeidos:', error);
      return 0;
    }
  }

  async getListaMensajesNoLeidos(): Promise<MensajeChat[]> {
    try {
      const response = await fetch(`${API_URL}/chat/mensajes-no-leidos`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo lista de mensajes no leídos');
      }

      const data = await response.json();
      return this.convertirApiAMensajes(data);
    } catch (error) {
      console.error('Error en getListaMensajesNoLeidos:', error);
      throw error;
    }
  }

  async getAllMensajesNoLeidos(): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/chat/todos-no-leidos`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo todos los mensajes no leídos');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getAllMensajesNoLeidos:', error);
      return 0;
    }
  }

  async getAllListaMensajesNoLeidos(): Promise<MensajeChat[]> {
    try {
      const response = await fetch(`${API_URL}/chat/todos-mensajes-no-leidos`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo lista de todos los mensajes no leídos');
      }

      const data = await response.json();
      return this.convertirApiAMensajes(data);
    } catch (error) {
      console.error('Error en getAllListaMensajesNoLeidos:', error);
      throw error;
    }
  }

  /**
   * Obtiene el conteo de mensajes no leídos para todas las campañas en una sola consulta
   * Optimizado para reducir el número de peticiones HTTP
   */
  async getMensajesNoLeidosPorTodasLasCampanas(): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${API_URL}/chat/todos-no-leidos-por-campana`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo mensajes no leídos por campaña');
      }

      const data = await response.json();
      // Convertir las claves de número a string para mantener consistencia
      const resultado: Record<string, number> = {};
      for (const [campanaId, count] of Object.entries(data)) {
        resultado[campanaId] = count as number;
      }
      return resultado;
    } catch (error) {
      console.error('Error en getMensajesNoLeidosPorTodasLasCampanas:', error);
      return {};
    }
  }

  async getMensajesNoLeidosPorCampana(campanaId: string): Promise<number> {
    try {
      const response = await fetch(`${API_URL}/chat/campana/${campanaId}/no-leidos`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo mensajes no leídos de la campaña');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getMensajesNoLeidosPorCampana:', error);
      return 0;
    }
  }

  private convertirApiAMensajes(data: any[]): MensajeChat[] {
    return data.map(mensaje => ({
      id: mensaje.id.toString(),
      campanaId: mensaje.campanaId.toString(),
      campanaNombre: mensaje.campanaNombre,
      remitente: mensaje.remitente,
      mensaje: mensaje.mensaje,
      leido: mensaje.leido || false,
      urgente: mensaje.urgente || false,
      fechaCreacion: new Date(mensaje.fechaCreacion)
    }));
  }
}

export const chatService = new ChatService();

