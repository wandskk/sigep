"use client";

import { Logo } from "../Logo";

export function LogoExamples() {
  return (
    <div className="space-y-8 p-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Logo Padrão</h2>
        <div className="p-4 border rounded-md">
          <Logo />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Logo Grande</h2>
        <div className="p-4 border rounded-md">
          <Logo width={60} height={60} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Apenas Ícone</h2>
        <div className="p-4 border rounded-md">
          <Logo showText={false} />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Logo com Classes Personalizadas</h2>
        <div className="p-4 border rounded-md bg-gray-100">
          <Logo className="bg-white p-2 rounded-lg shadow-sm" />
        </div>
      </div>
    </div>
  );
} 