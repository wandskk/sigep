import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  error?: string;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
          error && "text-red-500",
          className
        )}
        {...props}
      >
        {children}
        {error && <span className="ml-1 text-xs text-red-500">({error})</span>}
      </label>
    );
  }
);

Label.displayName = "Label";

export { Label }; 