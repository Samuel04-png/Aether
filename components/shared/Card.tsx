import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  // FIX: Add optional onClick handler to CardProps to make the component clickable.
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-card/95 backdrop-blur-xl border rounded-xl shadow-lg py-8 px-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      style={{ borderColor: 'oklch(var(--border) / 0.8)' }}
    >
      {children}
    </div>
  );
};

export default Card;
