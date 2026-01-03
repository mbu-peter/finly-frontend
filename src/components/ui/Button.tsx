import React from 'react';
import { cn } from './Card';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const variants = {
    primary: 'bg-white text-black hover:bg-zinc-200 focus:ring-zinc-400',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700 focus:ring-zinc-600',
    outline: 'bg-transparent border border-zinc-800 text-white hover:bg-zinc-900 focus:ring-zinc-800',
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <button
      className={cn(
        'rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#09090b] disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
