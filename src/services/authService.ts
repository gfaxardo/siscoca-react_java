// Servicio de autenticación con API real
const API_BASE_URL = 'https://api-int.yego.pro/api';

export interface Usuario {
  id: string;
  username: string;
  nombre: string;
  rol: 'Admin' | 'Trafficker' | 'Dueño';
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
  user?: {
    id: string;
    username: string;
    nombre: string;
    rol: string;
  };
  message?: string;
  expiresIn?: number;
}

class AuthService {
  private readonly STORAGE_KEY = 'siscoca_user';
  private readonly TOKEN_KEY = 'siscoca_token';

  async login(credentials: LoginRequest): Promise<{ success: boolean; user?: Usuario; message?: string }> {
    try {
      console.log('Intentando login con:', credentials);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || data.error || 'Error de autenticación'
        };
      }

      // Manejar diferentes estructuras de respuesta
      let token, user, success;
      
      if (data.token && data.user) {
        // Estructura: { token, user, success }
        token = data.token;
        user = data.user;
        success = data.success !== false; // true si no está definido
      } else if (data.access_token && data.user) {
        // Estructura alternativa: { access_token, user }
        token = data.access_token;
        user = data.user;
        success = true;
      } else if (data.data && data.data.token) {
        // Estructura anidada: { data: { token, user } }
        token = data.data.token;
        user = data.data.user;
        success = data.success !== false;
      } else {
        console.error('Estructura de respuesta no reconocida:', data);
        return {
          success: false,
          message: 'Estructura de respuesta no válida del servidor'
        };
      }

      if (token && user) {
        const usuario: Usuario = {
          id: user.id || user.userId || '1',
          username: user.username || user.email || credentials.username,
          nombre: user.nombre || user.name || user.username || credentials.username,
          rol: (user.rol || user.role || 'Trafficker') as 'Admin' | 'Trafficker' | 'Dueño',
          token: token,
          expiracion: new Date(Date.now() + (data.expiresIn || 3600) * 1000)
        };

        // Guardar en localStorage
        this.saveUser(usuario);
        
        console.log('Login exitoso:', usuario);
        return {
          success: true,
          user: usuario
        };
      }

      return {
        success: false,
        message: 'Token o datos de usuario no encontrados en la respuesta'
      };
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor'
      };
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getCurrentUser(): Usuario | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEY);
      if (!userData) return null;

      const user: Usuario = JSON.parse(userData);
      
      // Verificar si el token ha expirado
      if (new Date() > new Date(user.expiracion)) {
        this.logout();
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin puede hacer todo
    if (user.rol === 'Admin') return true;

    // Verificar rol específico
    return user.rol === requiredRole;
  }

  getAuthHeaders(): Record<string, string> {
    const user = this.getCurrentUser();
    if (!user) return {};

    return {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };
  }

  private saveUser(user: Usuario): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(this.TOKEN_KEY, user.token);
  }

  // Método para refrescar token si es necesario
  async refreshToken(): Promise<boolean> {
    try {
      const user = this.getCurrentUser();
      if (!user) return false;

      // Aquí implementarías la lógica de refresh si la API lo soporta
      // Por ahora, simplemente verificamos que el token no haya expirado
      return new Date() < new Date(user.expiracion);
    } catch (error) {
      console.error('Error refrescando token:', error);
      return false;
    }
  }
}

export const authService = new AuthService();
