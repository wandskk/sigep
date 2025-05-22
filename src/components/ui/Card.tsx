"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
  variant?: "default" | "outline" | "filled";
  onClick?: () => void;
}

export function Card({
  children,
  title,
  subtitle,
  footer,
  className = "",
  variant = "default",
  onClick,
}: CardProps) {
  const variantStyles = {
    default: "bg-white border border-gray-200 shadow-sm",
    outline: "bg-white border border-[#1E3A8A]/20",
    filled: "bg-[#F3F4F6]",
  };

  return (
    <div
      className={`
        rounded-lg overflow-hidden
        ${variantStyles[variant]}
        ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h3 className="text-lg font-medium text-[#374151]">{title}</h3>}
          {subtitle && <p className="text-sm text-[#374151]/70 mt-1">{subtitle}</p>}
        </div>
      )}
      
      <div className="px-6 py-5">{children}</div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-[#F3F4F6]/50">
          {footer}
        </div>
      )}
    </div>
  );
} 