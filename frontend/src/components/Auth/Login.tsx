import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username, password);
      
      if (!result.success) {
        setError(result.message || 'Error de autenticación');
      }
    } catch (error) {
      console.error('Error inesperado en login:', error);
      setError('Error inesperado al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo con rojo */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-48 w-96 h-96 rounded-full blur-[120px] animate-pulse" style={{ backgroundColor: 'rgba(239, 0, 0, 0.3)' }}></div>
        <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse" style={{ backgroundColor: 'rgba(239, 0, 0, 0.2)', animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/3 w-72 h-72 rounded-full blur-[100px] animate-pulse" style={{ backgroundColor: 'rgba(239, 0, 0, 0.2)', animationDelay: '2s' }}></div>
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      {/* Contenedor principal centrado */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Panel izquierdo - Branding centrado */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 p-12">
          {/* Logo */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" style={{ backgroundColor: '#ef0000' }}></div>
            <div className="relative w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-500" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          {/* Título */}
          <div className="space-y-4 animate-fadeIn">
            <h1 className="text-7xl font-black text-white tracking-tight">
              SISCOCA 2.0
            </h1>
            <div className="h-1 w-32 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}></div>
            <p className="text-xl text-gray-300 max-w-md mx-auto leading-relaxed">
              Sistema Inteligente de Gestión de Campañas
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 mt-8 w-full max-w-md animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            {[
              { title: 'Gestión Centralizada', desc: 'Control total de tus campañas' },
              { title: 'Métricas en Tiempo Real', desc: 'Datos actualizados al instante' },
              { title: 'Colaboración Eficiente', desc: 'Trabajo en equipo optimizado' }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(239, 0, 0, 0.5)';
                  const icon = e.currentTarget.querySelector('.feature-icon') as HTMLElement;
                  if (icon) icon.style.backgroundColor = '#ef0000';
                  const svg = e.currentTarget.querySelector('.feature-svg') as SVGElement;
                  if (svg) svg.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  const icon = e.currentTarget.querySelector('.feature-icon') as HTMLElement;
                  if (icon) icon.style.backgroundColor = 'rgba(239, 0, 0, 0.2)';
                  const svg = e.currentTarget.querySelector('.feature-svg') as SVGElement;
                  if (svg) svg.style.color = '#ff4444';
                }}
              >
                <div className="feature-icon w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors" style={{ backgroundColor: 'rgba(239, 0, 0, 0.2)' }}>
                  <svg className="feature-svg w-5 h-5 transition-colors" style={{ color: '#ff4444' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                  <p className="text-gray-400 text-xs">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho - Formulario de Login */}
        <div className="w-full max-w-md mx-auto">
          {/* Card del formulario */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20 animate-fadeIn">
            
            {/* Logo móvil */}
            <div className="lg:hidden mb-8 text-center">
              <div className="relative inline-block group">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" style={{ backgroundColor: '#ef0000' }}></div>
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}>
                  <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-1">SISCOCA 2.0</h1>
              <div className="h-0.5 w-20 mx-auto rounded-full mt-2" style={{ backgroundColor: '#ef0000' }}></div>
            </div>

            {/* Título del formulario */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Bienvenido
              </h2>
              <p className="text-gray-300">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Campo de Usuario */}
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-200 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    autoComplete="username"
                    className="block w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15"
                    style={{ '--focus-ring-color': '#ef0000' } as React.CSSProperties}
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #ef0000'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                </div>
              </div>

              {/* Campo de Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-200 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="block w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #ef0000'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Mensaje de Error */}
              {error && (
                <div className="rounded-xl p-4 animate-shake backdrop-blur-sm" style={{ backgroundColor: 'rgba(239, 0, 0, 0.2)', borderColor: '#ef0000', borderWidth: '1px' }}>
                  <div className="flex items-start gap-3">
                    <svg className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#ff4444' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium text-white">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {/* Botón de Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full group overflow-hidden"
              >
                <div className="absolute inset-0 rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(to right, #dc0000, #ef0000)' }}></div>
                <div className="relative flex justify-center items-center gap-3 px-6 py-4 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 group-hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Iniciando sesión...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Desarrollado por{' '}
                <span className="font-semibold text-white">
                  Tío Yego Developments
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
