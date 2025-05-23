"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function NotFoundContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "página";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <svg
          className="mx-auto h-16 w-16 text-[#1E3A8A]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
          Página não encontrada
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Desculpe, não conseguimos encontrar a {from} que você está procurando.
        </p>

        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A]"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
} 