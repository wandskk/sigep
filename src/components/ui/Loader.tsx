import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "white" | "border";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export function Loader({ 
  size = "md", 
  variant = "default",
  className,
  text,
  fullScreen = false
}: LoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const variantClasses = {
    default: "text-gray-600",
    primary: "text-blue-600",
    white: "text-white",
    border: "border-b-2 border-[#1E3A8A]"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const containerClasses = cn(
    "flex flex-col items-center gap-4",
    fullScreen && "fixed inset-0 z-50 flex items-center justify-center",
    className
  );

  const backgroundClasses = cn(
    "absolute inset-0",
    fullScreen && "bg-gradient-to-br from-blue-50/80 via-white/80 to-emerald-50/80 backdrop-blur-md animate-in fade-in duration-300"
  );

  const contentClasses = cn(
    "relative flex flex-col items-center gap-6",
    fullScreen && "animate-in fade-in slide-in-from-bottom-4 duration-500"
  );

  const LoaderContent = () => (
    <>
      {fullScreen && (
        <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 rounded-full blur-2xl animate-pulse" />
      )}
      <div className="relative">
        {fullScreen && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border-4 border-t-blue-600 border-r-emerald-600 border-b-blue-600 border-l-emerald-600 animate-[spin_1.5s_linear_infinite]" />
          </>
        )}
        {variant === "border" ? (
          <div className={cn(
            "rounded-full animate-spin",
            size === "sm" ? "h-4 w-4" : size === "md" ? "h-8 w-8" : "h-12 w-12",
            variantClasses[variant]
          )} />
        ) : (
          <div className={cn("relative flex items-center justify-center", size === "lg" ? "w-16 h-16" : "w-8 h-8")}>
            <Loader2 className={cn("animate-spin", sizeClasses[size], variantClasses[variant])} />
          </div>
        )}
      </div>
      {text && (
        <div className="relative">
          <p className={cn(
            "font-medium",
            textSizeClasses[size],
            fullScreen 
              ? "bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent animate-pulse"
              : variantClasses[variant]
          )}>
            {text}
          </p>
          {fullScreen && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-blue-600/0 via-blue-600 to-blue-600/0" />
          )}
        </div>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <div className={containerClasses}>
        <div className={backgroundClasses} />
        <div className={contentClasses}>
          <LoaderContent />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <LoaderContent />
    </div>
  );
} 