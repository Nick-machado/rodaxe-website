# Documentação Completa - Sistema Externo de Administração Rodaxe

Este documento contém todas as informações necessárias para construir um sistema administrativo externo que manipulará o site principal da Rodaxe.

---

## 📋 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA ADMIN (Novo Projeto)                 │
│  - Autenticação de administradores                             │
│  - CRUD de projetos do portfolio                               │
│  - Upload de mídias                                            │
│  - Gestão de conteúdo                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ API (Supabase JS Client)
┌─────────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS (Supabase)                    │
│  Project ID: zssghevtsktodjwbcxjn                              │
│  - Tabelas do Portfolio                                        │
│  - Storage para arquivos                                       │
│  - Autenticação                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ API (Supabase JS Client)
┌─────────────────────────────────────────────────────────────────┐
│                    SITE PRINCIPAL (Este Projeto)                │
│  - Exibe projetos publicados                                   │
│  - Galeria masonry                                             │
│  - Apenas leitura pública                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Conexão com Supabase

### Credenciais

```typescript
// Configuração do cliente Supabase
const SUPABASE_URL = "https://zssghevtsktodjwbcxjn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzc2doZXZ0c2t0b2Rqd2JjeGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzA3MzUsImV4cCI6MjA4MzkwNjczNX0.dKriBEJlzuvhYr3rSmgz8Go84K19gxSL7iR6DFe5GSM";

// Inicialização
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### Instalação

```bash
npm install @supabase/supabase-js
```

---

## 📊 Schema do Banco de Dados (A Criar no Sistema Admin)

### Tabela: `portfolio_projects`

Armazena os projetos do portfolio.

```sql
CREATE TABLE public.portfolio_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  location TEXT,
  cover_image_url TEXT NOT NULL,
  project_date DATE,
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_portfolio_projects_slug ON public.portfolio_projects(slug);
CREATE INDEX idx_portfolio_projects_is_published ON public.portfolio_projects(is_published);
CREATE INDEX idx_portfolio_projects_project_date ON public.portfolio_projects(project_date DESC);

-- RLS (Row Level Security)
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (para o site)
CREATE POLICY "Projetos publicados são públicos"
ON public.portfolio_projects
FOR SELECT
USING (is_published = true);

-- Política de escrita para admins (requer função has_role)
CREATE POLICY "Admins podem gerenciar projetos"
ON public.portfolio_projects
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

**Campos:**

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | Auto | Identificador único |
| `title` | TEXT | ✅ | Título do projeto (ex: "Casa de Praia") |
| `slug` | TEXT | ✅ | URL amigável única (ex: "casa-de-praia") |
| `location` | TEXT | ❌ | Localização (ex: "Cascais") |
| `cover_image_url` | TEXT | ✅ | URL da imagem de capa |
| `project_date` | DATE | ❌ | Data do projeto |
| `description` | TEXT | ❌ | Descrição do projeto |
| `is_published` | BOOLEAN | ✅ | Se está visível no site (default: true) |
| `created_at` | TIMESTAMP | Auto | Data de criação |
| `updated_at` | TIMESTAMP | Auto | Data de atualização |

---

### Tabela: `portfolio_media`

Armazena as mídias (imagens/vídeos) de cada projeto.

```sql
CREATE TABLE public.portfolio_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_portfolio_media_project_id ON public.portfolio_media(project_id);
CREATE INDEX idx_portfolio_media_sort_order ON public.portfolio_media(sort_order);

-- RLS
ALTER TABLE public.portfolio_media ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (acessa apenas mídia de projetos publicados)
CREATE POLICY "Mídia de projetos publicados é pública"
ON public.portfolio_media
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.portfolio_projects
    WHERE id = portfolio_media.project_id
    AND is_published = true
  )
);

-- Política de escrita para admins
CREATE POLICY "Admins podem gerenciar mídia"
ON public.portfolio_media
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

**Campos:**

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | Auto | Identificador único |
| `project_id` | UUID | ✅ | FK para portfolio_projects |
| `type` | TEXT | ✅ | Tipo: `'image'` ou `'video'` |
| `url` | TEXT | ✅ | URL do arquivo |
| `thumbnail_url` | TEXT | ❌ | Thumbnail (para vídeos) |
| `title` | TEXT | ❌ | Título opcional |
| `sort_order` | INTEGER | ✅ | Ordem de exibição (default: 0) |
| `created_at` | TIMESTAMP | Auto | Data de criação |

---

### Sistema de Autenticação e Roles

```sql
-- Enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles (separada da tabela de usuários por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- RLS na tabela de roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar role (SECURITY DEFINER evita recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Política: usuários podem ver suas próprias roles
CREATE POLICY "Usuários veem suas roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Política: apenas admins podem modificar roles
CREATE POLICY "Admins gerenciam roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

---

### Trigger para updated_at

```sql
-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para portfolio_projects
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 🗂️ Storage (Bucket para Arquivos)

### Criação do Bucket

```sql
-- Bucket público para portfolio
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true);

-- Políticas de storage
-- Leitura pública
CREATE POLICY "Arquivos do portfolio são públicos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'portfolio');

-- Upload apenas para admins autenticados
CREATE POLICY "Admins podem fazer upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio'
  AND public.has_role(auth.uid(), 'admin')
);

-- Delete apenas para admins
CREATE POLICY "Admins podem deletar arquivos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio'
  AND public.has_role(auth.uid(), 'admin')
);
```

### Estrutura de Pastas

```
portfolio/
├── covers/                    # Imagens de capa dos projetos
│   └── {timestamp}-{filename}
├── images/                    # Imagens das galerias
│   └── {project_id}/
│       └── {timestamp}-{filename}
└── videos/                    # Vídeos das galerias
    └── {project_id}/
        └── {timestamp}-{filename}
```

### Exemplo de Upload

```typescript
// Upload de arquivo
const uploadFile = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('portfolio')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from('portfolio')
    .getPublicUrl(data.path);

  return publicUrl;
};

// Uso
const coverUrl = await uploadFile(coverFile, `covers/${Date.now()}-${coverFile.name}`);
const imageUrl = await uploadFile(imageFile, `images/${projectId}/${Date.now()}-${imageFile.name}`);
```

---

## 🔧 Operações CRUD - Exemplos de Código

### Portfolio Projects

```typescript
// Interface TypeScript
interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  cover_image_url: string;
  project_date: string | null;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// LISTAR todos (admin - inclui não publicados)
const listProjects = async () => {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .order('project_date', { ascending: false });
  
  if (error) throw error;
  return data as PortfolioProject[];
};

// BUSCAR por slug
const getProjectBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data as PortfolioProject;
};

// CRIAR projeto
const createProject = async (project: Omit<PortfolioProject, 'id' | 'created_at' | 'updated_at'>) => {
  // Gerar slug a partir do título
  const slug = project.title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')       // Substitui caracteres especiais
    .replace(/(^-|-$)/g, '');          // Remove hífens das pontas

  const { data, error } = await supabase
    .from('portfolio_projects')
    .insert({ ...project, slug })
    .select()
    .single();
  
  if (error) throw error;
  return data as PortfolioProject;
};

// ATUALIZAR projeto
const updateProject = async (id: string, updates: Partial<PortfolioProject>) => {
  const { data, error } = await supabase
    .from('portfolio_projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as PortfolioProject;
};

// DELETAR projeto (cascade deleta mídias)
const deleteProject = async (id: string) => {
  const { error } = await supabase
    .from('portfolio_projects')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
```

### Portfolio Media

```typescript
// Interface TypeScript
interface PortfolioMedia {
  id: string;
  project_id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail_url: string | null;
  title: string | null;
  sort_order: number;
  created_at: string;
}

// LISTAR mídias de um projeto
const listMediaByProject = async (projectId: string) => {
  const { data, error } = await supabase
    .from('portfolio_media')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true });
  
  if (error) throw error;
  return data as PortfolioMedia[];
};

// ADICIONAR mídia
const addMedia = async (media: Omit<PortfolioMedia, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('portfolio_media')
    .insert(media)
    .select()
    .single();
  
  if (error) throw error;
  return data as PortfolioMedia;
};

// DELETAR mídia
const deleteMedia = async (id: string) => {
  // Primeiro busca a mídia para obter a URL do arquivo
  const { data: media } = await supabase
    .from('portfolio_media')
    .select('url')
    .eq('id', id)
    .single();

  // Deleta do storage (extrair path da URL)
  if (media?.url) {
    const path = media.url.split('/portfolio/')[1];
    if (path) {
      await supabase.storage.from('portfolio').remove([path]);
    }
  }

  // Deleta do banco
  const { error } = await supabase
    .from('portfolio_media')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// REORDENAR mídias
const reorderMedia = async (mediaItems: { id: string; sort_order: number }[]) => {
  const updates = mediaItems.map(({ id, sort_order }) =>
    supabase
      .from('portfolio_media')
      .update({ sort_order })
      .eq('id', id)
  );

  await Promise.all(updates);
};
```

### Autenticação

```typescript
// LOGIN
const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
};

// VERIFICAR se é admin
const checkIsAdmin = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single();

  return !!data;
};

// LOGOUT
const signOut = async () => {
  await supabase.auth.signOut();
};

// CRIAR primeiro admin (executar uma vez via SQL ou edge function protegida)
// INSERT INTO public.user_roles (user_id, role)
// VALUES ('uuid-do-usuario', 'admin');
```

---

## 📍 Rotas do Site Principal (Leitura)

O site principal consome os dados de forma read-only:

| Rota | Descrição | Query |
|------|-----------|-------|
| `/portfolio` | Grid de projetos | `portfolio_projects WHERE is_published = true` |
| `/portfolio/:slug` | Capa do projeto | `portfolio_projects WHERE slug = :slug AND is_published = true` |
| `/portfolio/:slug/gallery` | Galeria | `portfolio_media WHERE project_id = :id ORDER BY sort_order` |

---

## 🔐 Segurança - Checklist

- [ ] **RLS habilitado** em todas as tabelas
- [ ] **Roles separadas** em tabela `user_roles` (nunca em profiles/users)
- [ ] **SECURITY DEFINER** na função `has_role` para evitar recursão
- [ ] **Validação server-side** - nunca confiar apenas no frontend
- [ ] **Storage policies** configuradas para permitir apenas admins fazer upload
- [ ] **Nunca armazenar** credenciais no localStorage para verificação de admin

---

## 📝 Notas de Implementação

### Geração de Slug
```typescript
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')       // Caracteres especiais → hífen
    .replace(/(^-|-$)/g, '');          // Remove hífens extras
};
```

### Validação de Tipos
```typescript
// Zod schema para validação
import { z } from 'zod';

const projectSchema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  location: z.string().optional(),
  cover_image_url: z.string().url('URL inválida'),
  project_date: z.string().optional(),
  description: z.string().optional(),
  is_published: z.boolean().default(true),
});

const mediaSchema = z.object({
  project_id: z.string().uuid(),
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  thumbnail_url: z.string().url().optional(),
  title: z.string().optional(),
  sort_order: z.number().int().min(0).default(0),
});
```

---

## 🚀 Passos para Implementar o Sistema Admin

1. **Criar novo projeto Lovable** para o admin
2. **Configurar conexão** com o mesmo Supabase (usar credenciais acima)
3. **Executar migrações SQL** para criar tabelas, RLS e storage
4. **Criar primeiro usuário admin** via Supabase Auth + inserir role manualmente
5. **Implementar autenticação** com verificação de role
6. **Construir CRUD** para projetos e mídias
7. **Implementar upload** de arquivos para o storage
8. **Testar** criando um projeto e verificando se aparece no site principal

---

## 📎 Links Úteis

- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)
- [Storage API](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Docs](https://supabase.com/docs/guides/auth)
