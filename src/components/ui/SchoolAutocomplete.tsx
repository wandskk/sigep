import { useState, useEffect, useRef } from "react";
import { Command, CommandEmpty, CommandGroup } from "./Command";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover";
import { Button } from "./Button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./Input";

interface School {
  id: string;
  name: string;
}

interface SchoolAutocompleteProps {
  label: string;
  error?: string;
  schools: School[];
  onSchoolSelect?: (school: School | null) => void;
  value?: string;
  className?: string;
}

export function SchoolAutocomplete({
  label,
  error,
  schools,
  onSchoolSelect,
  value,
  className,
}: SchoolAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtra as escolas com base no termo de busca
  const filteredSchools = schools.filter((school) => {
    const searchTerm = searchValue.toLowerCase().trim();
    if (!searchTerm) return true;
    return school.name.toLowerCase().includes(searchTerm);
  });

  useEffect(() => {
    if (value) {
      const school = schools.find((s) => s.id === value);
      if (school) {
        setSelectedSchool(school);
        setSearchValue(school.name);
      }
    } else {
      setSelectedSchool(null);
      setSearchValue("");
    }
  }, [value, schools]);

  const handleSelect = (school: School) => {
    setSelectedSchool(school);
    setSearchValue(school.name);
    onSchoolSelect?.(school);
    setOpen(false);
    // Manter foco no input após seleção
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleClear = () => {
    setSelectedSchool(null);
    setSearchValue("");
    onSchoolSelect?.(null);
    setOpen(false);
    // Manter foco no input após limpar
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    
    // Abrir automaticamente quando o usuário digitar
    if (newValue.length > 0 && !open) {
      setOpen(true);
    }
    
    // Se limpar o campo, fechar o dropdown
    if (newValue.length === 0) {
      setOpen(false);
    }
  };

  const handleInputFocus = () => {
    // Abrir quando focar no campo, se houver texto ou escolas
    if (searchValue.length > 0 || schools.length > 0) {
      setOpen(true);
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Buscar escola..."
              value={searchValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className={cn(
                "pr-8 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg transition",
                error && "border-red-500",
                selectedSchool && "bg-muted/50"
              )}
            />
            {selectedSchool && (
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
          onOpenAutoFocus={(e) => e.preventDefault()}
          style={{ width: 'var(--radix-popper-anchor-width)' }}
        >
          <Command shouldFilter={false} className="w-full">
            <CommandGroup className="w-full">
              {filteredSchools.length === 0 ? (
                <CommandEmpty>Nenhuma escola encontrada.</CommandEmpty>
              ) : (
                filteredSchools.map((school) => (
                  <div
                    key={school.id}
                    onClick={() => handleSelect(school)}
                    className="cursor-pointer w-full px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Check
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          selectedSchool?.id === school.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{school.name}</span>
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