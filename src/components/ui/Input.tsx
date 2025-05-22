"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  labelClassName?: string;
  errorClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      className = "",
      labelClassName = "",
      errorClassName = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className={`block text-sm font-medium text-[#374151] mb-1 ${labelClassName}`}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full px-3 py-2 
              bg-white border 
              text-[#374151]
              rounded-md
              shadow-sm
              focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]
              disabled:bg-[#F3F4F6] disabled:cursor-not-allowed
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${error ? "border-[#EF4444] focus:ring-[#EF4444] focus:border-[#EF4444]" : "border-gray-300"}
              ${className}
            `}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <p
            className={`mt-1 text-sm ${
              error ? "text-[#EF4444]" : "text-[#374151]/70"
            } ${errorClassName}`}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
); 