# SIGEP - Sistema de Gestão Escolar de Baraúna

Este é um projeto [Next.js](https://nextjs.org) desenvolvido para gerenciar escolas no município de Baraúna/RN.

## Sistema de Autenticação

O SIGEP utiliza um sistema de autenticação completo baseado em NextAuth.js para controle de acesso:

- **Formulário de Login Responsivo**: Interface amigável para autenticação de usuários
- **Redirecionamento Inteligente**: Após login, usuários são direcionados para páginas apropriadas baseadas em seus perfis
- **Perfis de Acesso**: Suporte para múltiplos perfis (ALUNO, PROFESSOR, GESTOR, SECRETARIA e ADMIN)
- **Proteção de Rotas**: Middleware de autenticação que verifica permissões por perfil
- **Persistência**: Dados de usuários armazenados em banco de dados PostgreSQL via Prisma ORM

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

## Saiba Mais

Para aprender mais sobre as tecnologias utilizadas:

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Hook Form](https://react-hook-form.com)

## Deploy

O SIGEP pode ser facilmente implantado na [Vercel Platform](https://vercel.com/new).
