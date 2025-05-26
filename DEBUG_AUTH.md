# Debug de Problemas de Autenticação - SIGEP

## Problema Resolvido: "Login funciona mas precisa dar F5 para funcionar"

### 🔍 **Sintomas do Problema:**
- Usuário faz login com sucesso
- É redirecionado para a rota correta
- Depois é redirecionado de volta para o login
- Às vezes precisa dar F5 e tentar novamente

### 🛠️ **Soluções Implementadas:**

#### 1. **Middleware Melhorado** (`src/middleware.ts`)
- ✅ Timeout de 3 segundos para evitar travamentos
- ✅ Melhor tratamento de erros para evitar loops
- ✅ Logs detalhados para debug
- ✅ Verificação bidirecional (primeiro login ↔ dashboard)
- ✅ Headers de cache apropriados

#### 2. **LoginForm Refatorado** (`src/components/auth/LoginForm.tsx`)
- ✅ Função auxiliar com retry automático
- ✅ Verificação robusta de sessão (até 3 tentativas)
- ✅ Delay aumentado para sincronização (1 segundo)
- ✅ Logs detalhados para cada etapa
- ✅ Headers de cache para evitar dados antigos

#### 3. **Hook de Estado de Autenticação** (`src/hooks/useAuthState.ts`)
- ✅ Gerenciamento centralizado do estado de auth
- ✅ Verificação automática de primeiro login
- ✅ Função de refresh do estado
- ✅ Callbacks otimizados com useCallback

#### 4. **Página Trocar Senha Melhorada** (`src/app/trocar-senha/page.tsx`)
- ✅ Uso do novo hook de autenticação
- ✅ Verificação mais robusta de estado
- ✅ Melhor sincronização após mudança de senha
- ✅ Logs detalhados para debug

#### 5. **Componente de Debug** (`src/components/debug/SessionDebug.tsx`)
- ✅ Monitoramento visual do estado de sessão
- ✅ Botão para atualizar verificação de primeiro login
- ✅ Botão para recarregar página
- ✅ Timestamps das verificações
- ✅ Disponível apenas em desenvolvimento

### 🚀 **Como Usar o Debug:**

1. **Componente Visual de Debug:**
   - Procure o botão "Debug Session" no canto inferior direito
   - Clique para ver informações da sessão em tempo real
   - Use "Atualizar First Login" para forçar verificação
   - Use "Recarregar Página" se necessário

2. **Logs no Console:**
   - Abra o DevTools (F12)
   - Procure por logs com prefixos:
     - `[LOGIN]` - Processo de login
     - `[LOGIN_RAPIDO]` - Login rápido (desenvolvimento)
     - `[MIDDLEWARE]` - Verificações do middleware
     - `[TROCAR_SENHA]` - Processo de troca de senha
     - `[AUTH_STATE]` - Estado de autenticação
     - `[CHECK_FIRST_LOGIN]` - Verificação de primeiro login
     - `[CHANGE_PASSWORD]` - Mudança de senha

3. **Verificação Manual:**
   ```javascript
   // No console do navegador:
   
   // Verificar sessão atual
   fetch('/api/auth/session').then(r => r.json()).then(console.log)
   
   // Verificar primeiro login
   fetch('/api/auth/check-first-login').then(r => r.json()).then(console.log)
   ```

### 🔧 **Fluxo de Autenticação Corrigido:**

1. **Login:**
   - Usuário submete credenciais
   - NextAuth autentica
   - Aguarda 1 segundo para sincronização
   - Verifica sessão (até 3 tentativas)
   - Verifica primeiro login (até 3 tentativas)
   - Redireciona apropriadamente

2. **Middleware:**
   - Verifica se rota é pública
   - Verifica permissões por role
   - Verifica primeiro login (com timeout)
   - Redireciona se necessário

3. **Trocar Senha:**
   - Verifica autenticação
   - Verifica se realmente é primeiro login
   - Após mudança, atualiza estado
   - Aguarda sincronização
   - Redireciona para dashboard

### 📊 **Métricas de Melhoria:**

- **Timeout de requisições:** 3 segundos
- **Tentativas de retry:** 3 vezes
- **Delay de sincronização:** 1-1.5 segundos
- **Cache:** Desabilitado para dados críticos
- **Logs:** Detalhados em desenvolvimento

### 🐛 **Se o Problema Persistir:**

1. Verifique os logs no console
2. Use o componente de debug visual
3. Verifique se o banco de dados está atualizando o campo `firstLogin`
4. Verifique se há erros de rede nas requisições
5. Teste com diferentes usuários
6. Verifique se o NextAuth está configurado corretamente

### 🔄 **Comandos Úteis:**

```bash
# Iniciar em modo desenvolvimento
npm run dev

# Verificar logs do servidor
# (os logs aparecerão no terminal onde rodou npm run dev)

# Limpar cache do navegador
# Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
```

### 📝 **Notas Importantes:**

- O componente de debug só aparece em desenvolvimento
- Logs detalhados só aparecem em desenvolvimento
- Em produção, apenas erros críticos são logados
- O middleware tem fallbacks para evitar loops infinitos
- Todas as verificações têm timeout para evitar travamentos 