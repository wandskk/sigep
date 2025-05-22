import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { Navbar } from "@/components/ui/navbar";

export default function ThemeExamplePage() {
  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      {/* Navbar de exemplo */}
      <Navbar 
        items={[
          { label: "Início", href: "/", active: true },
          { label: "Alunos", href: "/alunos" },
          { label: "Professores", href: "/professores" },
          { label: "Turmas", href: "/turmas" },
          { label: "Configurações", href: "/configuracoes" },
        ]}
        rightContent={
          <Button 
            variant="outline" 
            size="sm"
            className="border-white text-white hover:bg-white/10"
          >
            Entrar
          </Button>
        }
      />
      
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-[#374151] mb-8">Exemplos de Tema SIGEP</h1>
        
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-semibold text-[#374151] mb-6">Botões</h2>
            
            <div className="space-y-4">
              <div className="space-x-4">
                <Button variant="primary">Botão Primário</Button>
                <Button variant="secondary">Botão Secundário</Button>
                <Button variant="outline">Outline</Button>
              </div>
              
              <div className="space-x-4">
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="warning">Aviso</Button>
                <Button variant="error">Erro</Button>
              </div>
              
              <div className="space-x-4">
                <Button size="sm">Pequeno</Button>
                <Button size="md">Médio</Button>
                <Button size="lg">Grande</Button>
              </div>
              
              <div className="space-x-4">
                <Button isLoading>Carregando</Button>
                <Button
                  leftIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  }
                >
                  Com Ícone
                </Button>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-[#374151] mb-6">Inputs</h2>
            
            <div className="space-y-4 max-w-md">
              <Input 
                label="Email"
                placeholder="seu@email.com"
                helperText="Insira seu email institucional"
              />
              
              <Input 
                label="Senha"
                type="password"
                placeholder="••••••••"
              />
              
              <Input 
                label="Nome"
                placeholder="Nome completo"
                error="Este campo é obrigatório"
              />
              
              <Input 
                label="Pesquisar"
                placeholder="Buscar aluno..."
                leftIcon={
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-gray-400">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                }
              />
            </div>
          </div>
        </section>
        
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-semibold text-[#374151] mb-6">Cards</h2>
            
            <div className="space-y-6">
              <Card 
                title="Card Padrão" 
                subtitle="Subtítulo explicativo"
              >
                <p className="text-[#374151]">
                  Este é um exemplo de card com título e subtítulo. 
                  Pode ser usado para exibir informações em destaque.
                </p>
              </Card>
              
              <Card variant="outline">
                <p className="text-[#374151]">
                  Card com variante outline, sem título.
                </p>
              </Card>
              
              <Card 
                variant="filled" 
                title="Card com Fundo"
                footer={
                  <div className="flex justify-end">
                    <Button size="sm">Ação</Button>
                  </div>
                }
              >
                <p className="text-[#374151]">
                  Este card tem fundo preenchido e um rodapé com ações.
                </p>
              </Card>
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-[#374151] mb-6">Alertas</h2>
            
            <div className="space-y-4">
              <Alert 
                variant="info"
                title="Informação"
              >
                Esta é uma mensagem informativa para o usuário.
              </Alert>
              
              <Alert 
                variant="success"
                title="Sucesso"
              >
                Operação realizada com sucesso!
              </Alert>
              
              <Alert 
                variant="warning"
                title="Atenção"
              >
                Verifique os dados antes de prosseguir.
              </Alert>
              
              <Alert 
                variant="error"
                title="Erro"
                onClose={() => console.log("Fechou alerta")}
              >
                Ocorreu um erro ao processar sua solicitação.
              </Alert>
            </div>
          </div>
        </section>
        
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-[#374151] mb-6">Paleta de Cores</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-md bg-[#1E3A8A] mb-2"></div>
              <p className="text-sm font-medium">Primária</p>
              <p className="text-xs text-[#374151]/70">#1E3A8A</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-md bg-[#10B981] mb-2"></div>
              <p className="text-sm font-medium">Secundária</p>
              <p className="text-xs text-[#374151]/70">#10B981</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-md bg-[#F3F4F6] border mb-2"></div>
              <p className="text-sm font-medium">Neutra Clara</p>
              <p className="text-xs text-[#374151]/70">#F3F4F6</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-md bg-[#374151] mb-2"></div>
              <p className="text-sm font-medium">Neutra Escura</p>
              <p className="text-xs text-[#374151]/70">#374151</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-md bg-[#FBBF24] mb-2"></div>
              <p className="text-sm font-medium">Alerta</p>
              <p className="text-xs text-[#374151]/70">#FBBF24</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-md bg-[#EF4444] mb-2"></div>
              <p className="text-sm font-medium">Erro</p>
              <p className="text-xs text-[#374151]/70">#EF4444</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 