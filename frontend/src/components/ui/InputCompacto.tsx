import { forwardRef } from 'react';

interface InputCompactoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const InputCompacto = forwardRef<HTMLInputElement, InputCompactoProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div>
        <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
        <input
          ref={ref}
          className={`w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>
    );
  }
);

InputCompacto.displayName = 'InputCompacto';

interface SelectCompactoProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const SelectCompacto = forwardRef<HTMLSelectElement, SelectCompactoProps>(
  ({ label, error, required, className = '', children, ...props }, ref) => {
    return (
      <div>
        <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
        <select
          ref={ref}
          className={`w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>
    );
  }
);

SelectCompacto.displayName = 'SelectCompacto';

interface TextareaCompactoProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const TextareaCompacto = forwardRef<HTMLTextAreaElement, TextareaCompactoProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div>
        <label className="block text-xs lg:text-sm font-semibold text-gray-700 mb-1">
          {label} {required && '*'}
        </label>
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 lg:px-4 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm resize-none ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}
      </div>
    );
  }
);

TextareaCompacto.displayName = 'TextareaCompacto';
