import { Container } from "@/components/layout/Container";

export default function UsersLoading() {
  return (
    <Container>
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="mt-1 h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="h-10 w-full max-w-2xl bg-gray-200 rounded animate-pulse"></div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="h-10 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div className="divide-y divide-gray-200">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
} 