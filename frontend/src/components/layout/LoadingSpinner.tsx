import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
  label?: string; // አማራጭ ጽሁፍ ለመጨመር
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-t-indigo-600',
  className = '',
  label
}) => {
  const sizeClasses = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          animate-spin 
          rounded-full 
          border-solid 
          border-slate-100 
          ${color}
        `}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
      {label && <p className="text-sm font-bold text-slate-500 animate-pulse">{label}</p>}
    </div>
  );
};

export default LoadingSpinner;