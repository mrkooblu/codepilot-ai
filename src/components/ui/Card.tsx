'use client';

import type { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  featured?: boolean;
}

export default function Card({
  featured = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg p-6 ${
        featured
          ? 'border-2 border-[#1A1A1A]'
          : 'border border-[#E8E8E8]'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
