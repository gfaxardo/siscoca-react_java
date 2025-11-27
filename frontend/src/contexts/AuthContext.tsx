import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, Usuario } from '../services/authService';

interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Verificar autenticación de forma síncrona al inicializar
  const getInitialUser = () => {
    try {
      return authService.getUser();
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return null;
    }
  };

  const [user, setUser] = useState<Usuario | null>(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);

  // Actualizar usuario cuando cambie en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const currentUser = authService.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error actualizando usuario:', error);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('AuthContext: Iniciando login...');
      const result = await authService.login({ username, password });
      console.log('AuthContext: Resultado del authService:', result);
      
      if (result.success && result.user) {
        console.log('AuthContext: Login exitoso, actualizando estado del usuario');
        // Actualizar el estado del usuario
        setUser(result.user);
        console.log('AuthContext: Usuario actualizado en el estado');
        return { success: true };
      } else {
        console.log('AuthContext: Login falló:', result.message);
        return { success: false, message: result.message || 'Error de autenticación' };
      }
    } catch (error) {
      console.error('AuthContext: Error en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return user?.rol === role;
  };

  const refreshUser = () => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}
