import { Usuario } from '../types/campana';

const API_URL = import.meta.env.VITE_API_URL || 'https://apisiscoca.yego.pro/api';

export interface CreateUsuarioRequest {
  username: string;
  password: string;
  nombre: string;
  iniciales: string;
  rol: 'Admin' | 'Trafficker' | 'Dueño' | 'Marketing';
  activo: boolean;
}

export interface UpdateUsuarioRequest {
  nombre: string;
  iniciales: string;
  rol: 'Admin' | 'Trafficker' | 'Dueño' | 'Marketing';
  password?: string;
  activo: boolean;
}

class UsuarioService {
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

  async getAllUsuarios(): Promise<Usuario[]> {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo usuarios');
      }

      const data = await response.json();
      return this.convertirApiAUsuarios(data);
    } catch (error) {
      console.error('Error en getAllUsuarios:', error);
      throw error;
    }
  }

  async getUsuarioById(id: string): Promise<Usuario> {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error obteniendo usuario');
      }

      const data = await response.json();
      return this.convertirApiAUsuario(data);
    } catch (error) {
      console.error('Error en getUsuarioById:', error);
      throw error;
    }
  }

  async createUsuario(usuario: CreateUsuarioRequest): Promise<Usuario> {
    try {
      const response = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(usuario)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creando usuario');
      }

      const data = await response.json();
      return this.convertirApiAUsuario(data);
    } catch (error) {
      console.error('Error en createUsuario:', error);
      throw error;
    }
  }

  async updateUsuario(id: string, usuario: UpdateUsuarioRequest): Promise<Usuario> {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(usuario)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error actualizando usuario');
      }

      const data = await response.json();
      return this.convertirApiAUsuario(data);
    } catch (error) {
      console.error('Error en updateUsuario:', error);
      throw error;
    }
  }

  async deleteUsuario(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Error eliminando usuario');
      }
    } catch (error) {
      console.error('Error en deleteUsuario:', error);
      throw error;
    }
  }

  private convertirApiAUsuarios(data: any[]): Usuario[] {
    return data.map(this.convertirApiAUsuario);
  }

  private convertirApiAUsuario(data: any): Usuario {
    return {
      id: data.id.toString(),
      username: data.username,
      nombre: data.nombre,
      iniciales: data.iniciales,
      rol: data.rol
    };
  }
}

export const usuarioService = new UsuarioService();

