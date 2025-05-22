# Documentação de Usuários - SIGEP

## Visão Geral

O Sistema de Gestão Escolar de Baraúna (SIGEP) utiliza um sistema de autenticação baseado em perfis para controlar o acesso às diferentes funcionalidades. Cada usuário possui um perfil específico que determina quais partes do sistema ele pode acessar.

## Perfis de Usuário

O sistema possui cinco perfis de usuário diferentes:

| Perfil     | Descrição                                                   |
|------------|-------------------------------------------------------------|
| ALUNO      | Estudantes matriculados nas escolas                         |
| PROFESSOR  | Docentes responsáveis pelas disciplinas                     |
| GESTOR     | Diretores e coordenadores das escolas                       |
| SECRETARIA | Funcionários da Secretaria Municipal de Educação            |
| ADMIN      | Administradores do sistema com acesso completo              |

## Permissões por Perfil

Cada perfil tem acesso a diferentes rotas no sistema:

| Rota          | ALUNO | PROFESSOR | GESTOR | SECRETARIA | ADMIN |
|---------------|:-----:|:---------:|:------:|:----------:|:-----:|
| /dashboard    |   ✓   |     ✓     |    ✓   |      ✓     |   ✓   |
| /alunos       |       |           |    ✓   |      ✓     |   ✓   |
| /professores  |       |           |    ✓   |      ✓     |   ✓   |
| /turmas       |       |     ✓     |    ✓   |      ✓     |   ✓   |
| /escolas      |       |           |        |      ✓     |   ✓   |
| /admin        |       |           |        |            |   ✓   |

## Dados Específicos por Perfil

### Aluno
- Matrícula
- Data de Nascimento
- Responsável
- Telefone
- Endereço

### Professor
- Formação
- Especialidade

### Gestor
- Cargo

### Secretaria
- Departamento
- Cargo

### Admin
- Não possui dados adicionais específicos

## Usuários de Teste

Para facilitar os testes, o sistema possui uma funcionalidade de seed que cria os seguintes usuários:

| Nome              | E-mail                | Perfil     | Senha    |
|-------------------|------------------------|------------|----------|
| Administrador     | admin@sigep.com       | ADMIN      | senha123 |
| Ana Silva         | secretaria@sigep.com  | SECRETARIA | senha123 |
| Carlos Oliveira   | gestor@sigep.com      | GESTOR     | senha123 |
| Maria Santos      | professor1@sigep.com  | PROFESSOR  | senha123 |
| João Costa        | professor2@sigep.com  | PROFESSOR  | senha123 |
| Pedro Almeida     | aluno1@sigep.com      | ALUNO      | senha123 |
| Júlia Ferreira    | aluno2@sigep.com      | ALUNO      | senha123 |
| Lucas Rodrigues   | aluno3@sigep.com      | ALUNO      | senha123 |

## Autenticação

O sistema utiliza NextAuth.js para gerenciar a autenticação e as sessões dos usuários. O processo de autenticação inclui:

1. Login com e-mail e senha
2. Verificação de credenciais
3. Criação de sessão segura
4. Verificação de permissões baseada no perfil

## Recuperação de Senha

O sistema possui um mecanismo de recuperação de senha que:

1. Gera um token único de recuperação
2. Envia um e-mail com o link para redefinição (simulado no ambiente de desenvolvimento)
3. Permite que o usuário defina uma nova senha ao usar o token válido

## Segurança

- Senhas armazenadas com hash utilizando bcrypt
- Proteção de rotas por middleware baseado em perfis
- Tokens de sessão seguros

## Como Acessar o Sistema

1. Inicie o servidor com `npm run dev`
2. Acesse http://localhost:3000
3. Faça login com um dos usuários de teste listados acima

## Executando o Seed de Usuários

Para popular o banco de dados com os usuários de teste, acesse a rota:

```
GET /api/seed
```

Esta rota só está disponível em ambiente de desenvolvimento.

## Como Converter este Documento para PDF

### Usando Node.js e markdown-pdf

1. Instale o pacote markdown-pdf:
   ```
   npm install -g markdown-pdf
   ```

2. Converta o arquivo:
   ```
   markdown-pdf documentacao-usuarios.md
   ```

### Usando Editores Online

Você também pode usar serviços online como:
- [Convertio](https://convertio.co/markdown-pdf/)
- [CloudConvert](https://cloudconvert.com/md-to-pdf)
- [MD2PDF](https://md2pdf.netlify.app/)

### Usando VS Code

Se estiver usando o VS Code, pode instalar a extensão "Markdown PDF" e usar o comando:
1. Abra o arquivo markdown
2. Pressione Ctrl+Shift+P
3. Digite "Markdown PDF: Export (pdf)"
4. Selecione a opção para exportar 