import { TareaPendiente } from '../types/campana';

import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

class TareaService {
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

  async getTareasPendientes(): Promise<TareaPendiente[]> {
    try {
      const response = await fetch(`${API_URL}/tareas/pendientes`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo tareas pendientes');
      }

      const data = await response.json();
      return this.convertirApiATareas(data);
    } catch (error) {
      console.error('Error en getTareasPendientes:', error);
      throw error;
    }
  }

  async getAllTareasPendientes(): Promise<TareaPendiente[]> {
    try {
      const response = await fetch(`${API_URL}/tareas/todas`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo todas las tareas pendientes');
      }

      const data = await response.json();
      return this.convertirApiATareas(data);
    } catch (error) {
      console.error('Error en getAllTareasPendientes:', error);
      throw error;
    }
  }

  async getTareasPorCampana(campanaId: string): Promise<TareaPendiente[]> {
    try {
      const response = await fetch(`${API_URL}/tareas/campana/${campanaId}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo tareas de la campaña');
      }

      const data = await response.json();
      return this.convertirApiATareas(data);
    } catch (error) {
      console.error('Error en getTareasPorCampana:', error);
      throw error;
    }
  }

  async getTareasCompletadasPorCampana(campanaId: string): Promise<TareaPendiente[]> {
    try {
      const response = await fetch(`${API_URL}/tareas/campana/${campanaId}/completadas`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo tareas completadas de la campaña');
      }

      const data = await response.json();
      return this.convertirApiATareas(data);
    } catch (error) {
      console.error('Error en getTareasCompletadasPorCampana:', error);
      throw error;
    }
  }

  async completarTarea(tareaId: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tareas/${tareaId}/completar`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error completando tarea');
      }
    } catch (error) {
      console.error('Error en completarTarea:', error);
      throw error;
    }
  }

  async generarTareasPendientes(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tareas/generar`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error generando tareas');
      }
    } catch (error) {
      console.error('Error en generarTareasPendientes:', error);
      throw error;
    }
  }

  async derivarTarea(tareaId: string, nuevoAsignadoA: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/tareas/${tareaId}/derivar?nuevoAsignadoA=${encodeURIComponent(nuevoAsignadoA)}`, {
        method: 'PUT',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error derivando tarea');
      }
    } catch (error) {
      console.error('Error en derivarTarea:', error);
      throw error;
    }
  }

  async obtenerUsuarios(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/usuarios/activos`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo usuarios');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en obtenerUsuarios:', error);
      throw error;
    }
  }

  private convertirApiATareas(data: any[]): TareaPendiente[] {
    return data.map(tarea => ({
      id: tarea.id.toString(),
      tipoTarea: tarea.tipoTarea,
      campanaId: tarea.campanaId.toString(),
      campanaNombre: tarea.campanaNombre,
      asignadoA: tarea.asignadoA,
      responsableRol: tarea.responsableRol,
      descripcion: tarea.descripcion,
      urgente: tarea.urgente || false,
      completada: tarea.completada || false,
      fechaCreacion: new Date(tarea.fechaCreacion),
      fechaCompletada: tarea.fechaCompletada ? new Date(tarea.fechaCompletada) : undefined
    }));
  }
}

export const tareaService = new TareaService();

