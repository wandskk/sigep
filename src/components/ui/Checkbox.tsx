"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1">
        <div className="flex items-center">
          <input
            type="checkbox"
            className={`h-4 w-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A] ${
              error ? "border-red-500" : ""
            } ${className || ""}`}
            ref={ref}
            {...props}
          />
          {label && (
            <label
              htmlFor={props.id}
              className="ml-2 block text-sm text-gray-700"
            >
              {label}
            </label>
          )}
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox"; 