"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function AccessDenied() {
  const { data: session } = useSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md text-center">
        <svg
          className="mx-auto h-16 w-16 text-red-600"
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
          Acesso Negado
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Você não tem permissão para acessar esta página.
        </p>

        {session ? (
          <div className="mt-6">
            <p className="mb-2 text-sm text-gray-500">
              Seu perfil: <strong>{session.user.role || "Sem perfil"}</strong>
            </p>
            <Link
              href="/dashboard"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Voltar ao Dashboard
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <p className="mb-2 text-sm text-gray-500">
              Você precisa estar logado para acessar o sistema.
            </p>
            <Link
              href="/login"
              className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Fazer Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 