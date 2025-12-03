import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray' | 'current' | string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'blue',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3'
  };

  // Mapeamento para cores padrão
  const colorMap: Record<string, string> = {
    blue: 'text-blue-500',
    white: 'text-white',
    gray: 'text-gray-400',
    current: 'text-current',
    red: 'text-red-500',
    green: 'text-green-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    pink: 'text-pink-500',
    indigo: 'text-indigo-500',
  };

  // Determina a classe de cor
  let colorClass: string;
  if (color in colorMap) {
    colorClass = colorMap[color as keyof typeof colorMap];
  } else if (color.startsWith('text-')) {
    // Se já é uma classe de cor do Tailwind
    colorClass = color;
  } else {
    // Fallback para azul
    colorClass = 'text-blue-500';
  }

  const spinnerClasses = `${sizeClasses[size]} ${colorClass} animate-spin rounded-full border-current border-t-transparent`;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div className={spinnerClasses} />
    </div>
  );
};