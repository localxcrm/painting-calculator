# 🏢 Admin Setup Guide - Painting Calculator

## 🚀 Como Configurar o Primeiro Admin User

### **Passo 1: Configurar Supabase**
1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **"New Project"**
3. Preencha:
   - **Name:** `painting-calculator` (ou qualquer nome)
   - **Database Password:** Escolha uma senha forte
   - **Region:** Selecione a mais próxima de você
4. Clique em **"Create new project"**

### **Passo 2: Obter Credenciais**
1. No painel lateral, vá para **Settings → API**
2. Copie:
   - **Project URL** (ex: `https://abcdefghijklmnop.supabase.co`)
   - **anon public key** (chave longa começando com `eyJ...`)

### **Passo 3: Configurar Ambiente**
1. Abra o arquivo `.env.local` na raiz do projeto
2. Substitua os valores:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

### **Passo 4: Desabilitar Confirmação de Email**
1. No Supabase Dashboard, vá para **Authentication → Settings**
2. **Desmarque** a opção **"Enable email confirmations"**
3. Clique em **"Save"**

### **Passo 5: Configurar Banco de Dados**
1. No Supabase, vá para **SQL Editor**
2. Copie e cole todo o conteúdo do arquivo `supabase-setup.sql`
3. Clique em **"Run"** para executar

### **Passo 5: Criar Primeiro Admin**
1. Execute: `npm run dev`
2. Abra: `http://localhost:3000/login`
3. Clique em **"Create Account"**
4. Preencha:
   - **Email:** seu-email@exemplo.com
   - **Password:** senha forte (mínimo 6 caracteres)
5. Clique em **"Sign Up"**
6. **Você será automaticamente logado** (sem confirmação de email!)
7. Você será redirecionado para o dashboard

### **Passo 6: Verificar Acesso Admin**
1. Após login, acesse: `http://localhost:3000/admin`
2. Você deve ver o **Admin Dashboard**
3. Vá para **"Manage Companies"** para adicionar empresas
4. Vá para **"Manage Users"** para ver seu perfil como admin

---

## 🎯 O Que Acontece Automaticamente

### **Primeiro Usuário = Admin**
- O primeiro usuário registrado automaticamente vira **admin**
- Todos os próximos usuários serão **user** por padrão
- O admin pode promover outros usuários

### **Empresa Padrão Criada**
- Uma empresa chamada **"Default Company"** é criada
- Todos os usuários são atribuídos a ela inicialmente
- Você pode criar mais empresas depois

### **Banco de Dados Seguro**
- **Row Level Security (RLS)** ativado
- Usuários só veem dados da própria empresa
- Admins podem gerenciar tudo

---

## 🛠️ Solução de Problemas

### **Erro: "Invalid supabaseUrl"**
- Verifique se as URLs no `.env.local` estão corretas
- Certifique-se de não ter espaços extras

### **Não Recebeu Email de Confirmação**
- Verifique sua caixa de spam
- No Supabase Dashboard → Authentication → Email Templates
- Configure um provedor de email (SendGrid, etc.)

### **Não Consegue Acessar Admin**
```sql
-- Execute no SQL Editor para verificar:
SELECT
  up.*,
  au.email,
  c.name as company_name
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
LEFT JOIN companies c ON up.company_id = c.id;
```

### **Resetar Roles (Cuidado!)**
```sql
-- Para resetar e tornar primeiro login admin novamente:
UPDATE user_profiles SET role = 'user';
```

---

## 📊 Próximos Passos Após Setup

### **1. Adicionar Empresas**
- Vá para `/admin/companies`
- Clique **"+ Add Company"**
- Configure preços específicos por empresa

### **2. Convidar Usuários**
- Vá para `/admin/users`
- Use **"+ Add User"** (integração futura com Supabase)
- Ou compartilhe o link de registro

### **3. Personalizar Configurações**
- Cada empresa pode ter preços diferentes
- Configure comissões por região
- Crie templates de projetos

---

## 🔐 Recursos de Segurança

- ✅ **Autenticação JWT** via Supabase
- ✅ **Row Level Security** no banco
- ✅ **Proteção CSRF** automática
- ✅ **HTTPS obrigatório** em produção
- ✅ **Logs de auditoria** disponíveis

---

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do terminal: `npm run dev`
2. Verifique o console do navegador (F12)
3. Consulte a documentação do Supabase
4. Abra uma issue no repositório

**🎉 Parabéns! Você agora tem um sistema completo de calculadora de pintura multi-tenant!**
