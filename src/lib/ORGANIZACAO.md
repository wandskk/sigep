# Organização do Código do SIGEP

Este documento descreve a organização do código do SIGEP, visando manter a estrutura organizada, facilitar a manutenção e promover a reutilização.

## Estrutura de Diretórios

```
lib/
├── utils/         # Funções utilitárias reutilizáveis
│   ├── auth/      # Autenticação (hash, tokens, etc.)
│   ├── date/      # Manipulação de datas
│   ├── text/      # Manipulação de texto
│   ├── number/    # Funções numéricas
│   ├── aluno/     # Utilidades para alunos
│   ├── turma/     # Utilidades para turmas
│   └── disciplina/ # Utilidades para disciplinas
│
├── helpers/       # Funções de ajuda específicas para domínios
│
├── actions/       # Funções que manipulam dados (server actions)
│   ├── auth/      # Ações de autenticação
│   ├── aluno/     # Ações para alunos
│   ├── turma/     # Ações para turmas
│   └── disciplina/ # Ações para disciplinas
│
├── types/         # Definições de tipos TypeScript
│   ├── auth/      # Tipos para autenticação
│   ├── aluno/     # Tipos para alunos
│   ├── turma/     # Tipos para turmas
│   └── disciplina/ # Tipos para disciplinas
│
├── constants/     # Valores constantes
│   ├── auth/      # Constantes de autenticação
│   ├── aluno/     # Constantes para alunos
│   ├── turma/     # Constantes para turmas
│   └── disciplina/ # Constantes para disciplinas
│
└── validators/    # Validadores de formulários e dados
    ├── auth/      # Validadores de autenticação
    ├── aluno/     # Validadores para alunos
    ├── turma/     # Validadores para turmas
    └── disciplina/ # Validadores para disciplinas
```

## Organização e Nomenclatura

### Utils
Funções utilitárias genéricas que podem ser reutilizadas em toda a aplicação. Nomeadas com o padrão `funcaoNome.ts`.

* **auth.utils.ts**: Funções para hash de senha, comparação, tokens
* **date.utils.ts**: Formatação e manipulação de datas
* **text.utils.ts**: Manipulação de strings, formatação de CPF, CEP, etc.
* **number.utils.ts**: Funções para formatação e cálculos numéricos

### Helpers
Funções auxiliares que combinam funções utilitárias para resolver problemas específicos de domínio.

### Actions
Funções que manipulam dados e implementam a lógica de negócio. Em aplicações Next.js, correspondem às Server Actions.

### Types
Definições de tipos TypeScript para as entidades e operações do sistema.

* **aluno.types.ts**: Interfaces para representar alunos, parâmetros, etc.
* **turma.types.ts**: Interfaces para representar turmas, filtros, etc.
* **disciplina.types.ts**: Interfaces para representar disciplinas

### Constants
Valores fixos usados na aplicação, como estados, opções de seleção, mensagens.

### Validators
Esquemas e funções de validação para formulários e dados de entrada.

## Convenções de Nomenclatura

* **Arquivos**: Use camelCase para nomes de arquivos: `aluno.utils.ts`, `auth.helpers.ts`
* **Funções**: Use camelCase para nomes de funções: `formatarData()`, `calcularIdade()`
* **Tipos e Interfaces**: Use PascalCase: `AlunoBasico`, `CreateAlunoParams`
* **Constantes**: Use UPPER_SNAKE_CASE para constantes globais e PascalCase para enums: `MAX_ALUNOS_POR_TURMA`, `SituacaoAluno`

## Importação

Cada categoria possui um arquivo `index.ts` que exporta todo o conteúdo do diretório, facilitando importações:

```typescript
// Modo recomendado de importação
import { formatarDataBR, calcularIdade } from '@/lib/utils/date';
import { AlunoBasico, AlunoCompleto } from '@/lib/types/aluno';
```

## Documentação

Documentação em formato JSDoc é usada para descrever funções, parâmetros e tipos. Exemplo:

```typescript
/**
 * Calcula a idade baseada na data de nascimento
 * @param birthDate Data de nascimento
 * @returns Idade em anos
 */
export function calcularIdade(birthDate: Date): number {
  // Implementação
}
``` 