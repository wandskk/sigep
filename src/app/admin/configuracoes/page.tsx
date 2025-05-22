"use client";

import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações do Sistema</h1>
      <Card className="mb-6">
        <div className="p-4">
          <p className="text-gray-700">
            Aqui você poderá configurar opções globais do SIGEP futuramente.
          </p>
        </div>
      </Card>
      <Alert variant="info" title="Em breve">
        Funcionalidades de configuração do sistema estarão disponíveis nesta página.
      </Alert>
    </div>
  );
} 