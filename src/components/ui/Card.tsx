import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card, cn };
