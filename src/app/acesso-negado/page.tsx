import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
            Acesso Negado
          </h1>
          <p className="mt-4 text-gray-700 dark:text-gray-300">
            Você não tem permissão para acessar esta página.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 