import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-lg overflow-hidden bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 shadow-sm ${className}`}>
      {children}
    </div>
  );
};