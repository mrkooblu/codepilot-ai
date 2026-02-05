'use client';

import type { HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'framework';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[#F8F8FA] text-[#6B6B6B] border-[#E8E8E8]',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  framework: 'bg-[#F8F8FA] text-[#1A1A1A] border-[#E8E8E8]',
};

export default function Badge({
  variant = 'default',
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full border ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
