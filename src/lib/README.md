# Estrutura de Pastas do SIGEP

Este documento descreve a organização de pastas do projeto SIGEP, explicando o propósito de cada diretório e seu conteúdo.

## Estrutura Geral

```
lib/
├── utils/         # Funções utilitárias para diferentes domínios
├── helpers/       # Funções auxiliares para operações específicas
├── actions/       # Ações do servidor organizadas por domínio
├── types/         # Definições de tipos TypeScript
├── constants/     # Constantes utilizadas no sistema
└── validators/    # Validadores organizados por domínio
```

## Detalhamento

### utils/

Contém funções utilitárias específicas para diferentes domínios:

- `auth.utils.ts` - Utilitários para autenticação
- `user.utils.ts` - Utilitários para manipulação de usuários
- `text.utils.ts` - Funções para manipulação de texto
- `number.utils.ts` - Funções para manipulação de números
- `date.utils.ts` - Funções para manipulação de datas
- `convert.utils.ts` - Funções para conversões entre tipos

Quando o sistema crescer, serão adicionados outros utilitários como:
- `paypal.utils.ts`
- `product.utils.ts`
- `currency.utils.ts`
- `cart.utils.ts`
- `price.utils.ts`
- `uuid.utils.ts`

### helpers/

Contém funções auxiliares específicas para domínios do sistema:

- `auth.helpers.ts` - Helpers para autenticação

Quando o sistema crescer, serão adicionados outros helpers como:
- `paypal.helpers.ts`
- `cart.helpers.ts`

### actions/

Ações do servidor organizadas por domínio:

- `auth/` - Ações relacionadas à autenticação
  - `authenticate.ts` - Ação para autenticar usuário
  - `register.ts` - Ação para registrar novo usuário
  - `reset-password.ts` - Ações para redefinição de senha

Quando o sistema crescer, serão adicionadas outras pastas como:
- `paypal/`
- `user/`
- `product/`
- `order/`
- `cart/`

### types/

Definições de tipos TypeScript para diferentes domínios:

- `auth.types.ts` - Tipos para autenticação

Quando o sistema crescer, serão adicionados outros tipos como:
- `paypal.types.ts`
- `forms.types.ts`
- `payment.types.ts`
- `shipping.types.ts`
- `checkout.types.ts`
- `order.types.ts`
- `cart.types.ts`
- `product.types.ts`

### constants/

Constantes organizadas por domínio:

- `auth.ts` - Constantes para autenticação
- `index.ts` - Arquivo central para exportação de todas as constantes

Quando o sistema crescer, serão adicionadas outras constantes como:
- `checkout.ts`
- `paypal.ts`
- `form.ts`
- `shipping.ts`
- `payment.ts`
- `app.ts`
- `products.ts`

### validators/

Validadores organizados em subpastas por domínio:

- `auth/` - Validadores para autenticação
  - `email.validator.ts` - Validador de email
  - `password.validator.ts` - Validador de senha

Quando o sistema crescer, serão adicionadas outras pastas como:
- `shipping/`
- `product/`
- `payment/`
- `order/`
- `currency/`
- `checkout/`
- `cart/`

## Convenções de Nomenclatura

- **Arquivos**: Utilizam kebab-case para nomes compostos: `reset-password.ts`
- **Pastas**: Utilizam kebab-case para nomes compostos
- **Funções**: Utilizam camelCase: `hashPassword()`
- **Constantes**: Utilizam SNAKE_CASE em maiúsculas: `PASSWORD_RESET_TOKEN_EXPIRY`
- **Tipos e Interfaces**: Utilizam PascalCase: `AuthResult`
- **Sufixos**:
  - Utilitários: `.utils.ts`
  - Helpers: `.helpers.ts`
  - Tipos: `.types.ts`
  - Validadores: `.validator.ts` 