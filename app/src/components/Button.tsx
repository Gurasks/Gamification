import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline-primary' | 'outline-secondary' | 'outline-danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  loading = false,
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed border';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    // Variantes sólidas
    'primary': 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-500 focus:ring-blue-500 border-transparent',
    'secondary': 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 focus:ring-gray-400 border-transparent',
    'danger': 'bg-red-500 hover:bg-red-600 text-white disabled:bg-gray-300 disabled:text-gray-500 focus:ring-red-500 border-transparent',

    // Variantes outline
    'outline-primary': 'bg-transparent border-blue-500 text-blue-500 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300 focus:ring-blue-500',
    'outline-secondary': 'bg-transparent border-gray-400 text-gray-700 hover:bg-gray-50 disabled:border-gray-300 disabled:text-gray-400 focus:ring-gray-400',
    'outline-danger': 'bg-transparent border-red-500 text-red-500 hover:bg-red-50 disabled:border-red-300 disabled:text-red-300 focus:ring-red-500'
  };

  // Determina a cor do spinner baseada na variante
  const getSpinnerColor = () => {
    if (variant.startsWith('outline-')) {
      return 'current'; // Usa a cor atual do texto para outline
    }
    return 'white'; // Para variantes sólidas
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {loading && (
        <LoadingSpinner
          size="sm"
          color={getSpinnerColor()}
          className="mr-2"
        />
      )}
      {children}
    </button>
  );
};