import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "./Command";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Button } from "./Button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";

interface Gestor {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface GestorAutocompleteProps {
  label: string;
  error?: string;
  gestores: Gestor[];
  onGestorSelect?: (gestor: Gestor | null) => void;
  value?: string;
  className?: string;
}

export function GestorAutocomplete({
  label,
  error,
  gestores,
  onGestorSelect,
  value,
  className,
}: GestorAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [selectedGestor, setSelectedGestor] = useState<Gestor | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const { setValue } = useFormContext();

  // Filtra os gestores com base no termo de busca
  const filteredGestores = gestores.filter((gestor) => {
    const searchTerm = searchValue.toLowerCase().trim();
    if (!searchTerm) return true; // Mostra todos quando não há busca
    return (
      gestor.user.name.toLowerCase().includes(searchTerm) ||
      gestor.user.email.toLowerCase().includes(searchTerm)
    );
  });

  useEffect(() => {
    if (value) {
      const gestor = gestores.find((g) => g.id === value);
      if (gestor) {
        setSelectedGestor(gestor);
        setSearchValue(gestor.user.name);
      }
    } else {
      setSelectedGestor(null);
      setSearchValue("");
    }
  }, [value, gestores]);

  const handleSelect = (gestor: Gestor) => {
    setSelectedGestor(gestor);
    setSearchValue(gestor.user.name);
    setValue("gestorId", gestor.id, { shouldValidate: true });
    onGestorSelect?.(gestor);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedGestor(null);
    setSearchValue("");
    setValue("gestorId", "", { shouldValidate: true });
    onGestorSelect?.(null);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar gestor..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={cn(
                "pr-8",
                error && "border-red-500",
                selectedGestor && "bg-muted/50"
              )}
            />
            {selectedGestor && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0" 
          align="start"
          style={{ width: 'var(--radix-popper-anchor-width)' }}
        >
          <Command shouldFilter={false} className="w-full">
            <CommandGroup className="w-full">
              {filteredGestores.length === 0 ? (
                <CommandEmpty>Nenhum gestor encontrado.</CommandEmpty>
              ) : (
                filteredGestores.map((gestor) => (
                  <div
                    key={gestor.id}
                    onClick={() => handleSelect(gestor)}
                    className="cursor-pointer w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Check
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          selectedGestor?.id === gestor.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate">{gestor.user.name}</span>
                        <span className="text-sm text-muted-foreground truncate">{gestor.user.email}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 