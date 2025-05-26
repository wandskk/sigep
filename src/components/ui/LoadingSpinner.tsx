interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ 
  message = "Carregando...", 
  size = "md",
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12", 
    lg: "h-16 w-16"
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-[#1E3A8A] ${sizeClasses[size]}`}></div>
      {message && (
        <p className="mt-4 text-gray-600 text-center">{message}</p>
      )}
    </div>
  );
} 