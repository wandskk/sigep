# SIGEP - Sistema de Gestão Escolar de Baraúna

Este é um projeto [Next.js](https://nextjs.org) desenvolvido para gerenciar escolas no município de Baraúna/RN.

## Sistema de Autenticação

O SIGEP utiliza um sistema de autenticação completo baseado em NextAuth.js para controle de acesso:

- **Interfaces Padronizadas**: Telas de login e recuperação de senha com design consistente e moderno
- **Formulário de Login Responsivo**: Interface amigável para autenticação de usuários
- **Redirecionamento Inteligente**: Após login, usuários são direcionados para páginas apropriadas baseadas em seus perfis
- **Perfis de Acesso**: Suporte para múltiplos perfis (ALUNO, PROFESSOR, GESTOR, SECRETARIA e ADMIN)
- **Proteção de Rotas**: Middleware de autenticação que verifica permissões por perfil
- **Persistência**: Dados de usuários armazenados em banco de dados PostgreSQL via Prisma ORM
- **Recuperação de Senha**: Processo de recuperação de senha com confirmação visual e validação de dados

## Interfaces de Autenticação

O sistema conta com interfaces padronizadas para autenticação:

- **Login**: Tela principal de acesso com campos para email e senha
- **Recuperação de Senha**: Interface para solicitar redefinição de senha via email
- **Layout Dividido**: Design moderno com área informativa e área de formulário
- **Validação em Tempo Real**: Feedback imediato para dados incorretos
- **Acessibilidade**: Componentes desenvolvidos seguindo boas práticas de acessibilidade

## Padronização de Código

O projeto segue padrões de codificação consistentes:

- **Nomenclatura PascalCase**: Componentes e seus arquivos utilizam PascalCase (ex: `Button.tsx`)
- **Importações com @**: Uso de alias para importações, facilitando referências a arquivos
- **Case-Sensitivity**: Respeito à sensibilidade de maiúsculas/minúsculas nos caminhos de importação
- **Componentes Reutilizáveis**: Estrutura modular com componentes UI isolados e reutilizáveis

## Iniciando o Desenvolvimento

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sigep.git
cd sigep
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (copie o arquivo .env.example):
```bash
cp .env.example .env.local
```

4. Gere o cliente Prisma:
```bash
npx prisma generate
```

5. Execute o seed para criar usuários de teste:
```bash
npx prisma db seed
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver o resultado.

## Usuários de Teste

Para testar o sistema, utilize os seguintes usuários criados pelo seed:

| Perfil     | Email                 | Senha     |
|------------|------------------------|-----------|
| ADMIN      | admin@sigep.com       | senha123  |
| SECRETARIA | secretaria@sigep.com  | senha123  |
| GESTOR     | gestor@sigep.com      | senha123  |
| PROFESSOR  | professor1@sigep.com  | senha123  |
| ALUNO      | aluno1@sigep.com      | senha123  |

## Tecnologias Utilizadas

- **Next.js 15**: Framework React com suporte a App Router
- **NextAuth.js**: Sistema completo de autenticação
- **Prisma ORM**: ORM para acesso ao banco de dados
- **PostgreSQL**: Banco de dados relacional
- **React Hook Form**: Gerenciamento de formulários com validação
- **TailwindCSS**: Framework CSS para estilização rápida
- **Zod**: Validação de esquemas e tipagem para formulários

## Saiba Mais

Para aprender mais sobre as tecnologias utilizadas:

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Hook Form](https://react-hook-form.com)
- [Zod Documentation](https://zod.dev)

## Deploy

O SIGEP pode ser facilmente implantado na [Vercel Platform](https://vercel.com/new).
