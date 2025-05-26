import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateSchoolFormData, createSchoolSchema, School } from "@/types/school";
import { Input } from "@/components/ui/Input";
import { PatternFormat } from "react-number-format";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { useEffect, useState, useRef } from "react";
import { GestorAutocomplete } from "@/components/ui/GestorAutocomplete";
import { Building2, MapPin, Phone, Mail, Globe, User, X, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Gestor {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface SchoolFormProps {
  school?: School; // Opcional - se não for fornecido, é modo de criação
  onSubmit: (data: CreateSchoolFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
  onHeightChange?: (height: number) => void;
}

type FormStep = "basic" | "contact" | "manager";

const estados = [
  { uf: "AC", nome: "Acre" },
  { uf: "AL", nome: "Alagoas" },
  { uf: "AP", nome: "Amapá" },
  { uf: "AM", nome: "Amazonas" },
  { uf: "BA", nome: "Bahia" },
  { uf: "CE", nome: "Ceará" },
  { uf: "DF", nome: "Distrito Federal" },
  { uf: "ES", nome: "Espírito Santo" },
  { uf: "GO", nome: "Goiás" },
  { uf: "MA", nome: "Maranhão" },
  { uf: "MT", nome: "Mato Grosso" },
  { uf: "MS", nome: "Mato Grosso do Sul" },
  { uf: "MG", nome: "Minas Gerais" },
  { uf: "PA", nome: "Pará" },
  { uf: "PB", nome: "Paraíba" },
  { uf: "PR", nome: "Paraná" },
  { uf: "PE", nome: "Pernambuco" },
  { uf: "PI", nome: "Piauí" },
  { uf: "RJ", nome: "Rio de Janeiro" },
  { uf: "RN", nome: "Rio Grande do Norte" },
  { uf: "RS", nome: "Rio Grande do Sul" },
  { uf: "RO", nome: "Rondônia" },
  { uf: "RR", nome: "Roraima" },
  { uf: "SC", nome: "Santa Catarina" },
  { uf: "SP", nome: "São Paulo" },
  { uf: "SE", nome: "Sergipe" },
  { uf: "TO", nome: "Tocantins" },
] as const;

export function SchoolForm({
  school,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  onHeightChange,
}: SchoolFormProps) {
  const [gestores, setGestores] = useState<Gestor[]>([]);
  const [selectedGestor, setSelectedGestor] = useState<Gestor | null>(null);
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [maxContentHeight, setMaxContentHeight] = useState<number>(0);
  
  const basicRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<HTMLDivElement>(null);

  const methods = useForm<CreateSchoolFormData>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: school ? {
      name: school.name,
      address: school.address,
      city: school.city,
      state: school.state,
      phone: school.phone,
      email: school.email,
      website: school.website || "",
      gestorId: school.gestorId || undefined,
    } : undefined,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = methods;

  // Carrega a lista de gestores
  useEffect(() => {
    async function loadGestores() {
      try {
        const response = await fetch("/api/gestores");
        if (!response.ok) {
          throw new Error(`Erro ao carregar gestores: ${response.status}`);
        }
        const data = await response.json();
        setGestores(data);
      } catch (error) {
        console.error("Erro ao carregar gestores:", error);
      }
    }
    loadGestores();
  }, []);

  // Reset form when school changes (apenas no modo de edição)
  useEffect(() => {
    if (school) {
      reset({
        name: school.name,
        address: school.address,
        city: school.city,
        state: school.state,
        phone: school.phone,
        email: school.email,
        website: school.website || "",
        gestorId: school.gestorId || undefined,
      });
    }
  }, [school, reset]);

  // Atualiza o gestor selecionado quando o valor do formulário muda
  useEffect(() => {
    if (watch("gestorId")) {
      const gestor = gestores.find(g => g.id === watch("gestorId"));
      setSelectedGestor(gestor || null);
    } else {
      setSelectedGestor(null);
    }
  }, [watch("gestorId"), gestores]);

  const handleGestorSelect = (gestor: Gestor | null) => {
    setSelectedGestor(gestor);
    setValue("gestorId", gestor?.id || undefined, { shouldValidate: true });
  };

  const steps: { id: FormStep; label: string; icon: React.ReactNode }[] = [
    {
      id: "basic",
      label: "Informações Básicas",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      id: "contact",
      label: "Contato",
      icon: <Phone className="h-5 w-5" />,
    },
    {
      id: "manager",
      label: "Gestor",
      icon: <User className="h-5 w-5" />,
    },
  ];

  const validateStep = async (step: FormStep) => {
    switch (step) {
      case "basic":
        return await trigger(["name", "address", "city", "state"]);
      case "contact":
        return await trigger(["phone", "email"]);
      case "manager":
        return await trigger(["gestorId"]);
      default:
        return true;
    }
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (!isValid) return;

    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  // Função para calcular a altura máxima do conteúdo
  const calculateMaxContentHeight = () => {
    const heights = [
      basicRef.current?.offsetHeight || 0,
      contactRef.current?.offsetHeight || 0,
      managerRef.current?.offsetHeight || 0,
    ];
    const maxHeight = Math.max(...heights);
    setMaxContentHeight(maxHeight);
  };

  // Calcula a altura máxima quando o componente monta e quando o conteúdo muda
  useEffect(() => {
    calculateMaxContentHeight();
    // Recalcula após um pequeno delay para garantir que todos os elementos estejam renderizados
    const timer = setTimeout(() => {
      calculateMaxContentHeight();
      // Notifica sobre a mudança na altura
      if (onHeightChange) {
        const totalHeight = maxContentHeight + 200; // 200px para cabeçalho, navegação e botões
        onHeightChange(totalHeight);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentStep, gestores, selectedGestor, onHeightChange, maxContentHeight]);

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return (
          <div ref={basicRef} className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-6 space-y-6 min-h-[294px]">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  label="Nome da Escola"
                  error={errors.name?.message}
                  {...register("name")}
                  icon={<Building2 className="h-4 w-4 text-gray-400" />}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Endereço"
                  error={errors.address?.message}
                  {...register("address")}
                  icon={<MapPin className="h-4 w-4 text-gray-400" />}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <Input
                  label="Cidade"
                  error={errors.city?.message}
                  {...register("city")}
                  icon={<MapPin className="h-4 w-4 text-gray-400" />}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <div className="relative">
                  <select
                    {...register("state")}
                    className={cn(
                      "w-full px-3 py-2 bg-white/50 backdrop-blur-sm border rounded-md shadow-sm",
                      "focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600",
                      "disabled:bg-gray-100 disabled:cursor-not-allowed",
                      "appearance-none pl-10 pr-10",
                      errors.state ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                    )}
                  >
                    <option value="">Selecione o estado</option>
                    {estados.map((estado) => (
                      <option key={estado.uf} value={estado.uf}>
                        {estado.uf} - {estado.nome}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {errors.state?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div ref={contactRef} className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-6 space-y-6 min-h-[294px]">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    customInput={Input}
                    onValueChange={(values) => {
                      setValue("phone", values.value);
                    }}
                    error={errors.phone?.message}
                    className="pl-10 w-full bg-white/50 backdrop-blur-sm"
                    type="tel"
                    value={watch("phone")}
                  />
                </div>
                {errors.phone?.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Input
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...register("email")}
                  icon={<Mail className="h-4 w-4 text-gray-400" />}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Website (opcional)"
                  type="url"
                  error={errors.website?.message}
                  {...register("website")}
                  icon={<Globe className="h-4 w-4 text-gray-400" />}
                  className="bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        );

      case "manager":
        return (
          <div ref={managerRef} className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl p-6 space-y-6 min-h-[294px]">
            <div className="space-y-4">
              <GestorAutocomplete
                label="Selecione o Gestor"
                error={errors.gestorId?.message}
                gestores={gestores}
                value={watch("gestorId")}
                onGestorSelect={handleGestorSelect}
                className="bg-white/50 backdrop-blur-sm"
              />
              
              {selectedGestor && (
                <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedGestor.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {selectedGestor.user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGestorSelect(null)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  // Calcula a altura total necessária para o modal
  const modalHeight = Math.max(maxContentHeight + 200, 294); // 200px para cabeçalho, navegação e botões, mínimo de 294px

  return (
    <FormProvider {...methods}>
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="p-6"
        style={{ minHeight: `${modalHeight}px` }}
      >
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Navegação por abas */}
        <div className="mb-8">
          <nav className="flex space-x-4" aria-label="Tabs">
            {steps.map((step) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStep(step.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentStep === step.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                )}
              >
                {step.icon}
                <span>{step.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo do passo atual */}
        <div className="space-y-8 min-h-[294px]">
          {renderStepContent()}
        </div>

        {/* Botões de navegação */}
        <div className="mt-8 flex justify-between">
          <div className="flex space-x-3">
            {currentStep !== "basic" && (
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              Cancelar
            </Button>

            {currentStep !== "manager" ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                disabled={isSubmitting}
                className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                {isSubmitting 
                  ? (school ? "Salvando..." : "Criando...") 
                  : (school ? "Salvar Alterações" : "Criar Escola")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
} 