"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  items?: NavItem[];
  rightContent?: ReactNode;
}

export function Navbar({ items = [], rightContent }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1E3A8A] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo showText className="text-white" />
            
            {/* Links em tela grande */}
            <div className="hidden md:ml-10 md:flex md:items-center md:space-x-4">
              {items.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    item.active
                      ? "bg-[#15286D] text-white"
                      : "text-white/80 hover:bg-[#15286D] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Conteúdo à direita */}
          <div className="hidden md:flex md:items-center">
            {rightContent}
          </div>
          
          {/* Botão do menu mobile */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white hover:bg-[#15286D] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-expanded="false"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Abrir menu principal</span>
              {/* Ícone de hambúrguer */}
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  item.active
                    ? "bg-[#15286D] text-white"
                    : "text-white/80 hover:bg-[#15286D] hover:text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          {/* Conteúdo à direita para mobile */}
          {rightContent && (
            <div className="pt-4 pb-3 border-t border-white/10">
              <div className="px-2">{rightContent}</div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
} 