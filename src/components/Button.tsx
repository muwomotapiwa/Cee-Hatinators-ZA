import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'crimson' | 'dark';
  [key: string]: any;
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-crimson text-white hover:bg-crimson-mid',
    ghost: 'bg-transparent text-offwhite border border-white/40 hover:border-gold hover:text-gold',
    crimson: 'bg-crimson text-white hover:bg-crimson-mid',
    dark: 'bg-crimson-dark text-silver hover:bg-crimson',
  };

  return (
    <button
      className={cn(
        'px-9 py-4 font-sans text-[11px] tracking-[2.5px] uppercase cursor-pointer font-semibold transition-all duration-250 inline-block no-underline disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
