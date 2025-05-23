import { Card } from "@/components/ui/Card";
import { formatarCPF, formatarTelefone, formatarEmail, formatarParentesco } from "@/lib/utils/formatadores";
import { ResponsavelCardProps } from "@/lib/types/responsavel";
import { cn } from "@/lib/utils";

export function ResponsavelCard({ responsavel, className }: ResponsavelCardProps) {
  if (!responsavel) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-gray-500">
          Nenhum responsável cadastrado.
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Informações do Responsável</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Nome</p>
              <p className="mt-1 text-sm text-gray-900">{responsavel.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Parentesco</p>
              <p className="mt-1 text-sm text-gray-900">{formatarParentesco(responsavel.parentesco)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">CPF</p>
              <p className="mt-1 text-sm text-gray-900">{formatarCPF(responsavel.cpf)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Telefone</p>
              <p className="mt-1 text-sm text-gray-900">{formatarTelefone(responsavel.telefone)}</p>
            </div>
            {responsavel.email && (
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="mt-1 text-sm text-gray-900">{formatarEmail(responsavel.email)}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <p className="text-sm font-medium text-gray-500">Endereço</p>
              <p className="mt-1 text-sm text-gray-900">{responsavel.endereco}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 