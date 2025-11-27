// Servicio de autenticación con backend local que valida con Yego
// El backend tiene context-path: /api, por lo que no necesitamos agregar /api aquí
import { API_BASE_URL } from '../config/api';

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  iniciales?: string;
  rol: 'Admin' | 'Trafficker' | 'Dueño' | 'Marketing';
  token: string;
  expiracion: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: Usuario;
  message?: string;
}

class AuthService {
  private readonly USER_KEY = 'siscoca_user';

  async login(credentials: LoginRequest): Promise<{ success: boolean; user?: Usuario; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify(credentials)
      });

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Error parsing JSON response:', error);
        return {
          success: false,
          message: 'Error procesando la respuesta del servidor'
        };
      }

      if (!response.ok) {
        return {
          success: false,
          message: data?.message || `Error del servidor (${response.status})`
        };
      }

      // El backend local ya maneja la validación con Yego y devuelve la estructura esperada
      if (data.success && (data.accessToken || data.token) && data.user) {
        const usuario: Usuario = {
          id: data.user.id || '1',
          username: data.user.username,
          nombre: data.user.nombre || data.user.username,
          iniciales: data.user.iniciales,
          rol: data.user.rol || 'Trafficker',
          token: data.accessToken || data.token,
          expiracion: new Date(Date.now() + 3600000) // 1 hora
        };

        // Guardar en localStorage
        this.saveUser(usuario);

        return {
          success: true,
          user: usuario
        };
      }

      return {
        success: false,
        message: data.message || 'Error de autenticación'
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('siscoca_token');
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No hay sesión activa'
        };
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Error al cambiar la contraseña'
        };
      }

      return {
        success: true,
        message: data.message || 'Contraseña cambiada exitosamente'
      };
    } catch (error) {
      console.error('Error en changePassword:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  getUser(): Usuario | null {
    try {
      const userStr = localStorage.getItem(this.USER_KEY);
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      
      // Verificar si el token ha expirado
      if (user.expiracion && new Date(user.expiracion) < new Date()) {
        this.logout();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    const user = this.getUser();
    return user !== null;
  }

  getToken(): string | null {
    const user = this.getUser();
    return user?.token || null;
  }

  private saveUser(user: Usuario): void {
    try {
      // Guardar el usuario completo en la clave principal
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      
      // También guardar el token por separado como respaldo
      if (user.token) {
        localStorage.setItem('token', user.token);
        localStorage.setItem('siscoca_token', user.token);
      }
    } catch (error) {
      console.error('Error al guardar usuario en localStorage:', error);
      
      // Si hay error de cuota, intentar limpiar y guardar solo lo esencial
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('⚠️ localStorage lleno, limpiando datos antiguos...');
        try {
          // Limpiar datos no esenciales
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && !key.includes('siscoca') && !key.includes('token')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          
          // Intentar guardar de nuevo
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          if (user.token) {
            localStorage.setItem('token', user.token);
            localStorage.setItem('siscoca_token', user.token);
          }
        } catch (retryError) {
          console.error('Error en reintento de guardado:', retryError);
        }
      }
    }
  }
}

export const authService = new AuthService();