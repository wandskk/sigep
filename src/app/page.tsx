import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl mb-6">
              SIGEP
            </h1>
            <p className="text-xl sm:text-2xl mb-8">
              Sistema de Gestão Escolar de Baraúna
            </p>
            <p className="text-lg mb-10">
              Integrando e modernizando os processos pedagógicos e administrativos
              das escolas municipais de Baraúna/RN
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/entrar"
                className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium text-lg"
              >
                Entrar
              </Link>
              <Link
                href="/registrar"
                className="bg-transparent border-2 border-white hover:bg-white/10 px-6 py-3 rounded-lg font-medium text-lg"
              >
                Registrar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Principais Funcionalidades
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Uma plataforma completa para gestão escolar
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 text-2xl mb-4">
                👩‍🏫
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Para Professores
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li>Lançamento de notas</li>
                <li>Registro de presença</li>
                <li>Acesso às turmas</li>
                <li>Acompanhamento de alunos</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 text-2xl mb-4">
                👨‍🎓
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Para Alunos
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li>Visualização de notas</li>
                <li>Consulta de presenças</li>
                <li>Informações sobre turmas</li>
                <li>Atualização de dados pessoais</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 text-2xl mb-4">
                👨‍💼
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Para Gestores
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li>Cadastro de turmas e cursos</li>
                <li>Acompanhamento de desempenho</li>
                <li>Relatórios gerenciais</li>
                <li>Gestão completa da escola</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="text-blue-600 dark:text-blue-400 text-2xl mb-4">
                📄
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Para Secretaria
              </h3>
              <ul className="text-gray-600 dark:text-gray-400 space-y-2">
                <li>Acesso global às escolas</li>
                <li>Relatórios estatísticos</li>
                <li>Auditoria de dados</li>
                <li>Integrações com outros sistemas</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Benefícios
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Transformando a gestão escolar em Baraúna
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">
                📊
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Decisões baseadas em dados
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Acesso a informações em tempo real para melhor tomada de decisão
              </p>
            </div>

            <div className="text-center">
              <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">
                🌱
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sustentabilidade
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Redução do uso de papel e recursos físicos
              </p>
            </div>

            <div className="text-center">
              <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">
                🔒
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Segurança de dados
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Controle de acesso e proteção das informações sensíveis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">SIGEP</h2>
            <p className="mb-4">Sistema de Gestão Escolar de Baraúna</p>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} SIGEP - Todos os direitos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
