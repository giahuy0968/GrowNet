import React from 'react';
import { cn } from '../../design/tokens';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    loading?: boolean;
}

const base = 'btn';
const variants: Record<Variant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
};
const sizes: Record<Size, string> = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', leftIcon, rightIcon, loading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(base, variants[variant], sizes[size], loading && 'opacity-70 cursor-wait', className)}
                {...props}
            >
                {leftIcon && <span className="inline-flex items-center">{leftIcon}</span>}
                <span>{children}</span>
                {rightIcon && <span className="inline-flex items-center">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';
