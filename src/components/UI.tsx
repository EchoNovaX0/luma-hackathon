import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    children: ReactNode;
}

export const Button = ({ variant = 'primary', children, className, ...props }: ButtonProps) => {
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
        outline: "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50",
    };

    return (
        <button
            className={clsx(
                "px-6 py-2.5 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: 'normal' | 'large';
}

export const Card = ({ children, className, padding = 'normal' }: CardProps) => {
    return (
        <div className={clsx(
            "bg-white border border-slate-100 rounded-2xl shadow-sm",
            padding === 'normal' ? 'p-6' : 'p-8',
            className
        )}>
            {children}
        </div>
    );
};
