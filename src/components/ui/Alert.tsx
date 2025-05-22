"use client";

import { ReactNode } from "react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  children,
  variant = "info",
  title,
  icon,
  onClose,
  className = "",
}: AlertProps) {
  const variantStyles = {
    info: "bg-[#60A5FA]/10 text-[#1E3A8A] border-[#60A5FA]",
    success: "bg-[#10B981]/10 text-[#059669] border-[#10B981]",
    warning: "bg-[#FBBF24]/10 text-[#B45309] border-[#FBBF24]",
    error: "bg-[#EF4444]/10 text-[#B91C1C] border-[#EF4444]",
  };

  return (
    <div
      className={`
        rounded-md border-l-4 p-4
        ${variantStyles[variant]}
        ${className}
      `}
      role="alert"
    >
      <div className="flex">
        {icon && <div className="flex-shrink-0 mr-3">{icon}</div>}
        
        <div className="flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm opacity-90">{children}</div>
        </div>
        
        {onClose && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-md p-1.5 inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={onClose}
            aria-label="Fechar"
          >
            <span className="sr-only">Fechar</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 