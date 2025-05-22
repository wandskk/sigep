import { LogoExamples } from "@/components/examples/LogoExamples";

export default function LogoExamplesPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Exemplos de Logo</h1>
      <p className="mb-6">
        Este componente de Logo utiliza a imagem SVG da pasta public e pode ser
        personalizado com diferentes tamanhos e estilos.
      </p>
      
      <LogoExamples />
    </div>
  );
} 