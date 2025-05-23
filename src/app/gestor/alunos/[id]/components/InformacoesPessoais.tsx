import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatarCPF, formatarTelefone, formatarEmail, formatarData } from "@/lib/utils/formatadores";
import { AlunoWithRelations } from "@/lib/actions/aluno";
import Link from "next/link";
import { 
  UserCircle, 
  Calendar, 
  FileText, 
  Hash, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Clock, 
  AlertCircle,
  School,
  Pencil,
  Users,
  BookOpen,
  ArrowRight
} from "lucide-react";

interface CardHeaderProps {
  icon: React.ReactNode;
  title: string;
  color: string;
  onEdit?: () => void;
}

function CardHeader({ icon, title, color, onEdit }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className={`text-lg font-semibold text-${color}-900`}>{title}</h3>
      </div>
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className={`text-${color}-600 hover:text-${color}-700 hover:bg-${color}-50`}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Editar
        </Button>
      )}
    </div>
  );
}

interface InformacoesPessoaisProps {
  aluno: AlunoWithRelations;
  onEditBasicas?: () => void;
  onEditContato?: () => void;
  onEditTurmas?: () => void;
  onEditAdicionais?: () => void;
}

interface TurmaCardProps {
  turma: {
    id: string;
    nome: string;
    codigo: string;
    turno: string;
    escola: {
      id: string;
      name: string;
      address: string;
      city: string;
      state: string;
      phone: string;
    };
  };
}

function TurmaCard({ turma }: TurmaCardProps) {
  return (
    <Link 
      href={`/gestor/turmas/${turma.id}`}
      className="block bg-white rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-all duration-200 hover:border-purple-200 group"
    >
      <div className="p-5">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <School className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-purple-900">
                {turma.nome}
              </h4>
              <span className="text-sm text-purple-600">{turma.escola.name}</span>
            </div>
          </div>
          <span className="px-2.5 py-1 text-sm font-medium text-purple-700 bg-purple-50 rounded-full">
            {turma.codigo}
          </span>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-purple-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-purple-500" />
            <span>Turno: {turma.turno}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-purple-500" />
            <span className="truncate">{turma.escola.address}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <School className="w-4 h-4 text-purple-500" />
            <span>{turma.escola.city} - {turma.escola.state}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4 text-purple-500" />
            <span>{turma.escola.phone}</span>
          </div>
        </div>

        {/* Ação */}
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-purple-50">
          <div className="flex items-center gap-2 text-sm font-medium text-purple-600 group-hover:text-purple-700">
            <span>Ver detalhes da turma</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function InformacoesPessoais({ 
  aluno,
  onEditBasicas,
  onEditContato,
  onEditTurmas,
  onEditAdicionais
}: InformacoesPessoaisProps) {
  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <CardHeader
          icon={<UserCircle className="w-6 h-6 text-blue-600" />}
          title="Informações Básicas"
          color="blue"
          onEdit={onEditBasicas}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <UserCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">Nome Completo</p>
              <p className="mt-1 text-base text-gray-900">{aluno.user.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">Data de Nascimento</p>
              <p className="mt-1 text-base text-gray-900">{formatarData(aluno.dataNascimento)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">CPF</p>
              <p className="mt-1 text-base text-gray-900">{formatarCPF(aluno.cpf)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Hash className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">Matrícula</p>
              <p className="mt-1 text-base text-gray-900">{aluno.matricula}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Contato */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-green-100">
        <CardHeader
          icon={<Mail className="w-6 h-6 text-green-600" />}
          title="Contato"
          color="green"
          onEdit={onEditContato}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700">Email</p>
              <p className="mt-1 text-base text-gray-900">{formatarEmail(aluno.user.email)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700">Telefone</p>
              <p className="mt-1 text-base text-gray-900">{formatarTelefone(aluno.telefone)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <MapPin className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-700">Endereço</p>
              <p className="mt-1 text-base text-gray-900">
                {aluno.endereco}, {aluno.cidade} - {aluno.estado}, CEP: {aluno.cep}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Turma */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100">
        <CardHeader
          icon={<School className="w-6 h-6 text-purple-600" />}
          title="Turma Atual"
          color="purple"
          onEdit={onEditTurmas}
        />
        {aluno.turmas.length > 0 ? (
          <TurmaCard turma={aluno.turmas[0].turma} />
        ) : (
          <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">Aluno não está matriculado em nenhuma turma</p>
          </div>
        )}
      </Card>

      {/* Informações Adicionais */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-amber-100">
        <CardHeader
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          title="Informações Adicionais"
          color="amber"
          onEdit={onEditAdicionais}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Data de Cadastro</p>
              <p className="mt-1 text-base text-gray-900">{formatarData(aluno.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Última Atualização</p>
              <p className="mt-1 text-base text-gray-900">{formatarData(aluno.updatedAt)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Situação</p>
              <p className="mt-1 text-base text-gray-900">{aluno.situacao}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700">Data de Matrícula</p>
              <p className="mt-1 text-base text-gray-900">{formatarData(aluno.dataMatricula)}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 