import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Iniciando proceso de login...');

    try {
      const result = await login(username, password);
      console.log('Resultado del login:', result);
      
      if (!result.success) {
        console.error('Login falló:', result.message);
        setError(result.message || 'Error de autenticación');
      } else {
        console.log('Login exitoso, el AuthContext manejará la redirección automáticamente');
        // No necesitamos redirección manual, React manejará el estado automáticamente
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      setError('Error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-600">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            SISCOCA 2.0
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestión de Campañas
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error de autenticación
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Creado por <span className="font-semibold text-primary-600">Tío Yego Developments</span>
            </p>
            <button
              type="button"
              onClick={() => {
                const API_URL = import.meta.env.VITE_API_URL || 'https://apisiscoca.yego.pro/api';
                console.log('=== DEBUG LOGIN DETALLADO ===');
                console.log('Usuario:', username);
                console.log('Password:', password);
                console.log('API URL:', `${API_URL}/auth/login`);
                
                // Probar la API directamente con JSON simple
                const jsonString = `{"username":"${username}","password":"${password}"}`;
                
                console.log('JSON simple enviado:', jsonString);
                console.log('Solo username y password:', { username, password });
                
                fetch(`${API_URL}/auth/login`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                  },
                  mode: 'cors',
                  credentials: 'omit',
                  body: jsonString,
                })
                .then(response => {
                  console.log('=== RESPUESTA COMPLETA ===');
                  console.log('Status:', response.status);
                  console.log('Status Text:', response.statusText);
                  console.log('Headers:', Object.fromEntries(response.headers.entries()));
                  console.log('OK:', response.ok);
                  
                  return response.json();
                })
                .then(data => {
                  console.log('=== DATOS DE RESPUESTA ===');
                  console.log('Data completa:', data);
                  console.log('Tipo de data:', typeof data);
                  console.log('Claves disponibles:', Object.keys(data || {}));
                  
                  if (data?.message) console.log('Mensaje:', data.message);
                  if (data?.error) console.log('Error:', data.error);
                  if (data?.detail) console.log('Detalle:', data.detail);
                  if (data?.code) console.log('Código:', data.code);
                })
                .catch(error => {
                  console.error('=== ERROR EN PETICIÓN ===');
                  console.error('Error completo:', error);
                  console.error('Tipo de error:', typeof error);
                  console.error('Mensaje de error:', error.message);
                });
              }}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 underline"
            >
              🔍 Debug Completo API
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
