import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface ConfirmacionCriticaProps {
  titulo: string;
  descripcion: string;
  onConfirmar: (password: string) => Promise<void>;
  onCancelar: () => void;
  isLoading?: boolean;
}

export default function ConfirmacionCritica({ 
  titulo, 
  descripcion, 
  onConfirmar, 
  onCancelar,
  isLoading = false 
}: ConfirmacionCriticaProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim()) {
      setError('Por favor, ingresa tu contraseña');
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmar(password);
    } catch (err) {
      setError('Contraseña incorrecta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🔒</span>
            <div>
              <h3 className="text-white font-bold text-lg">{titulo}</h3>
              <p className="text-red-100 text-sm">Acción crítica requerida</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-900 text-sm leading-relaxed">{descripcion}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🔑 Confirma tu identidad
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                autoFocus
                disabled={isSubmitting || isLoading}
              />
              {error && (
                <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                  <span>⚠️</span>
                  <span>{error}</span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancelar}
                disabled={isSubmitting || isLoading}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting || isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Confirmar</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-3 rounded-b-xl border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            ⚠️ Esta acción no se puede deshacer
          </p>
        </div>
      </div>
    </div>
  );
}


