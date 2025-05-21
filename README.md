# SIGEP - Sistema de Gestão Escolar de Baraúna

O SIGEP é uma solução digital desenvolvida com o objetivo de modernizar, integrar e facilitar os processos pedagógicos e administrativos das escolas da rede municipal de ensino de Baraúna/RN. Trata-se de uma plataforma web segura, responsiva e intuitiva, com funcionalidades adaptadas às necessidades de alunos, professores, gestores escolares e da Secretaria Municipal de Educação.

## Objetivo

Centralizar e digitalizar a gestão escolar em um único sistema, reduzindo burocracias, facilitando o acesso à informação, promovendo a transparência e melhorando o acompanhamento da vida escolar dos alunos por todos os envolvidos no processo educacional.

## Principais Funcionalidades

### Para Professores 👩‍🏫
- Lançamento de notas
- Registro de presença (chamada)
- Acesso às turmas por horário/disciplina
- Visualização de desempenho dos alunos

### Para Alunos 👨‍🎓
- Visualização de notas e presenças
- Consulta de turmas e disciplinas
- Cadastro de informações pessoais

### Para Gestores Escolares 👨‍💼
- Cadastro de turmas, professores, alunos e cursos
- Acompanhamento de desempenho por turma e por escola
- Relatórios gerenciais e pedagógicos

### Para Secretaria Municipal de Educação 📄
- Acesso global a todas as escolas da rede
- Geração de relatórios estatísticos
- Auditoria de dados e integrações futuras com sistemas estaduais/federais

## Tecnologias Utilizadas

- **Next.js 15** com suporte full-stack
- **React 19** para interfaces modernas e dinâmicas
- **Prisma ORM** com suporte a PostgreSQL
- **TailwindCSS** para estilização responsiva
- **Zod + React Hook Form** para validação de dados robusta
- **Autenticação** com NextAuth e controle de acesso por roles
- **WebSockets** para atualização em tempo real de chamadas e notas

## Requisitos de Sistema

- Node.js 18.x ou superior
- PostgreSQL 13 ou superior
- NPM 9.x ou superior

## Instalação e Configuração

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/sigep.git
cd sigep
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env` com suas variáveis de ambiente:
```
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sigep"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta-aqui"
```

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev --name init
```

5. Popule o banco de dados com dados iniciais:
```bash
npm run seed
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

7. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

### Usuário Administrador Padrão
- Email: admin@sigep.gov.br
- Senha: Admin@123

## Módulos do Sistema

O SIGEP é composto pelos seguintes módulos:

1. **Autenticação**: Login, registro, recuperação de senha, controle de roles
2. **Escolas**: Cadastro de escolas, diretoria, cursos
3. **Turmas**: CRUD de turmas, vínculo com cursos e horários
4. **Professores**: Cadastro, vínculo com disciplinas, lançamento de chamadas e notas
5. **Alunos**: Cadastro, matrícula, visualização de notas e faltas
6. **Notas**: Lançamento por disciplina, listagem por aluno
7. **Chamada**: Registro por professor no horário correto
8. **Gestão Escolar**: Relatórios, gerenciamento completo da escola
9. **Secretaria**: Painel global de supervisão das escolas

## Estrutura do Projeto

```
sigep/
├── prisma/                  # Modelos de banco de dados e migrations
├── public/                  # Arquivos estáticos
├── src/
│   ├── app/                 # Rotas e páginas da aplicação
│   │   ├── api/             # Rotas de API
│   │   ├── (auth)/          # Páginas de autenticação
│   │   ├── dashboard/       # Dashboard principal
│   │   └── ...              # Outras páginas
│   ├── components/          # Componentes React reutilizáveis
│   ├── lib/                 # Utilitários e funções auxiliares
│   ├── providers/           # Provedores de contexto
│   └── types/               # Definições de tipos TypeScript
└── ...
```

## Controle de Acesso (RBAC)

O sistema implementa um controle de acesso baseado em funções (RBAC):

- **Aluno**: acesso apenas às próprias notas, faltas e informações pessoais
- **Professor**: acesso e edição apenas das turmas e disciplinas atribuídas
- **Gestor Escolar**: gestão completa da unidade escolar
- **Secretaria de Educação**: controle total e leitura de todas as unidades
- **Administrador**: acesso total ao sistema

## Benefícios Esperados

- Redução de uso de papel e planilhas descentralizadas
- Tomada de decisão baseada em dados reais
- Facilidade no acompanhamento do processo ensino-aprendizagem
- Maior transparência e segurança na gestão de informações

## Licença

Este projeto é de propriedade da Secretaria Municipal de Educação de Baraúna/RN.

## Contribuição

Para contribuir com o projeto, por favor entre em contato com a equipe de desenvolvimento ou abra uma issue para discutir suas ideias.
