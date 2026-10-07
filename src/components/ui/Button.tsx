// Единая кнопка: gold для главного действия, ghost/danger для вторичных.

import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-gold text-abyss font-bold hover:shadow-glowGold disabled:hover:shadow-none',
  ghost:
    'bg-white/5 text-white/80 border border-edge hover:bg-white/10 hover:text-white',
  danger:
    'bg-blood/15 text-blood border border-blood/30 hover:bg-blood/25',
};

const SIZES: Record<ButtonSize, string> = {
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-8 py-3.5 text-base rounded-xl tracking-wide uppercase',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  children,
  className = '',
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-300
        disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
