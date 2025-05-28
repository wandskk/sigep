"use client";

import { ButtonHTMLAttributes, ReactNode, forwardRef } from "react";

// Variantes de botão disponíveis
export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link" | "warning" | "error" | "danger" | "success" | "destructive" | "minimal" | "minimal-outline" | "minimal-ghost";
// Tamanhos de botão disponíveis
type ButtonSize = "sm" | "md" | "lg" | "icon";

// Props para o componente Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

// Componente Button
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}, ref) => {
  // Mapeia variantes para classes de estilo
  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#1E3A8A] text-white hover:bg-[#1E3A8A]/90",
    secondary: "bg-white text-[#374151] border border-gray-300 hover:bg-gray-50",
    outline: "bg-transparent border border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A]/10",
    ghost: "bg-transparent text-[#1E3A8A] hover:bg-[#1E3A8A]/10",
    link: "bg-transparent text-[#1E3A8A] hover:underline p-0 h-auto",
    warning: "bg-[#FBBF24] text-[#374151] hover:bg-[#FBBF24]/90",
    error: "bg-[#EF4444] text-white hover:bg-[#EF4444]/90",
    danger: "bg-red-600 text-white hover:bg-red-700",
    success: "bg-green-600 text-white hover:bg-green-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    minimal: "bg-gray-100 text-gray-700 hover:bg-gray-200 border-0",
    "minimal-outline": "bg-transparent border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700",
    "minimal-ghost": "bg-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50",
  };

  // Mapeia tamanhos para classes de estilo
  const sizeStyles = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
    icon: "h-8 w-8 p-0",
  };

  // Define classe base do botão
  const baseStyles = `
    inline-flex items-center justify-center 
    font-medium rounded-md 
    transition-all duration-150 
    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-300
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Combina todas as classes
  const buttonClasses = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      
      {!isLoading && leftIcon && <span className="mr-1.5">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-1.5">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = "Button"; 