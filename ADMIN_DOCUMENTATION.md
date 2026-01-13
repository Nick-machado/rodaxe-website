# Documentação - API do Site Principal Rodaxe

Este documento descreve as tabelas do banco de dados e endpoints necessários para o painel administrativo manipular o site principal.

---

## 🗄️ Banco de Dados (Supabase)

### Informações de Conexão
- **Project ID**: `zssghevtsktodjwbcxjn`
- **URL**: `https://zssghevtsktodjwbcxjn.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzc2doZXZ0c2t0b2Rqd2JjeGpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMzA3MzUsImV4cCI6MjA4MzkwNjczNX0.dKriBEJlzuvhYr3rSmgz8Go84K19gxSL7iR6DFe5GSM`

---

## 📊 Tabelas do Portfolio

### `portfolio_projects`
Tabela principal de projetos do portfolio.

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

**Exemplo de inserção:**
```sql
INSERT INTO portfolio_projects (title, slug, location, cover_image_url, project_date, is_published)
VALUES ('Villa Moderna', 'villa-moderna', 'Sintra', 'https://...', '2025-01-10', true);
```

---

### `portfolio_media`
Mídias (imagens e vídeos) de cada projeto.

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

**Exemplo de inserção:**
```sql
INSERT INTO portfolio_media (project_id, type, url, sort_order)
VALUES ('uuid-do-projeto', 'image', 'https://...', 0);
```

---

## 📊 Tabelas de Vídeos (Showcase)

### `videos`
Vídeos exibidos na página inicial.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | Auto | Identificador único |
| `title` | TEXT | ✅ | Título do vídeo |
| `description` | TEXT | ❌ | Descrição |
| `video_url` | TEXT | ✅ | URL do vídeo (YouTube/Vimeo embed) |
| `thumbnail_url` | TEXT | ❌ | URL da thumbnail |
| `created_at` | TIMESTAMP | Auto | Data de criação |
| `updated_at` | TIMESTAMP | Auto | Data de atualização |

---

### `niches`
Categorias/nichos de atuação.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | Auto | Identificador único |
| `name` | TEXT | ✅ | Nome do nicho (ex: "Imobiliário") |
| `slug` | TEXT | ✅ | URL amigável |
| `description` | TEXT | ❌ | Descrição do nicho |
| `featured_image_url` | TEXT | ❌ | Imagem de destaque |
| `created_at` | TIMESTAMP | Auto | Data de criação |
| `updated_at` | TIMESTAMP | Auto | Data de atualização |

---

### `tags`
Tags para categorizar vídeos.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | Auto | Identificador único |
| `name` | TEXT | ✅ | Nome da tag |
| `slug` | TEXT | ✅ | URL amigável |
| `created_at` | TIMESTAMP | Auto | Data de criação |

---

### `video_niches`
Relação N:N entre vídeos e nichos.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | Auto | Identificador único |
| `video_id` | UUID | ✅ | FK para videos |
| `niche_id` | UUID | ✅ | FK para niches |
| `created_at` | TIMESTAMP | Auto | Data de criação |

---

### `video_tags`
Relação N:N entre vídeos e tags.

| Coluna | Tipo | Obrigatório | Descrição |
|--------|------|-------------|-----------|
| `id` | UUID | Auto | Identificador único |
| `video_id` | UUID | ✅ | FK para videos |
| `tag_id` | UUID | ✅ | FK para tags |
| `created_at` | TIMESTAMP | Auto | Data de criação |

---

## 🗂️ Storage (Buckets)

### `portfolio`
Bucket público para imagens e vídeos do portfolio.

**Estrutura sugerida:**
```
portfolio/
├── covers/          # Imagens de capa dos projetos
│   └── {timestamp}.{ext}
├── images/          # Imagens das galerias
│   └── {project_id}/
│       └── {timestamp}-{filename}
└── videos/          # Vídeos das galerias
    └── {project_id}/
        └── {timestamp}-{filename}
```

**Upload de arquivo:**
```typescript
const { data, error } = await supabase.storage
  .from('portfolio')
  .upload(`covers/${Date.now()}.jpg`, file);

// Obter URL pública
const { data: { publicUrl } } = supabase.storage
  .from('portfolio')
  .getPublicUrl(data.path);
```

---

## 🔐 Autenticação e RLS

### Roles de Usuário
O sistema usa `app_role` com valores: `'admin'` | `'user'`

### Tabela `user_roles`
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | Identificador único |
| `user_id` | UUID | FK para auth.users |
| `role` | app_role | Role do usuário |
| `created_at` | TIMESTAMP | Data de criação |

### Função de Verificação
```sql
-- Verifica se usuário tem determinada role
SELECT has_role(auth.uid(), 'admin'::app_role);
```

### Políticas RLS
Todas as tabelas têm RLS habilitado com políticas:
- **SELECT público**: `niches`, `tags`, `videos`, `video_niches`, `video_tags`, `portfolio_projects` (is_published=true), `portfolio_media`
- **INSERT/UPDATE/DELETE**: Apenas usuários com role `admin`

---

## 📍 Rotas Públicas do Site

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/portfolio` | Grid de projetos do portfolio |
| `/portfolio/:slug` | Página de capa do projeto |
| `/portfolio/:slug/gallery` | Galeria masonry do projeto |
| `/niche/:slug` | Vídeos filtrados por nicho |
| `/link/:token` | Links públicos únicos |

---

## 🛠️ Operações CRUD Necessárias no Admin

### Portfolio Projects
```typescript
// Listar todos (incluindo não publicados)
const { data } = await supabase
  .from('portfolio_projects')
  .select('*')
  .order('created_at', { ascending: false });

// Criar
const slug = title.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-');

await supabase.from('portfolio_projects').insert({
  title, slug, location, cover_image_url, project_date, is_published
});

// Atualizar
await supabase.from('portfolio_projects')
  .update({ title, location, ... })
  .eq('id', projectId);

// Deletar (cascade remove mídias)
await supabase.from('portfolio_projects')
  .delete()
  .eq('id', projectId);
```

### Portfolio Media
```typescript
// Listar mídias de um projeto
const { data } = await supabase
  .from('portfolio_media')
  .select('*')
  .eq('project_id', projectId)
  .order('sort_order');

// Adicionar mídia
await supabase.from('portfolio_media').insert({
  project_id: projectId,
  type: 'image', // ou 'video'
  url: publicUrl,
  sort_order: nextOrder
});

// Deletar mídia
await supabase.from('portfolio_media')
  .delete()
  .eq('id', mediaId);

// Reordenar (atualizar sort_order de múltiplas mídias)
for (const [index, media] of reorderedMedia.entries()) {
  await supabase.from('portfolio_media')
    .update({ sort_order: index })
    .eq('id', media.id);
}
```

---

## 📝 Notas Importantes

1. **Geração de Slug**: Sempre gerar slugs únicos a partir do título, removendo acentos e caracteres especiais.

2. **Upload de Imagens**: Sempre fazer upload para o bucket `portfolio` antes de inserir na tabela.

3. **Cascade Delete**: Deletar um projeto automaticamente remove todas as mídias associadas.

4. **Ordenação**: Use `sort_order` para controlar a ordem das mídias na galeria.

5. **Publicação**: Projetos com `is_published = false` não aparecem no site público mas são visíveis no admin.

---

## 🔗 Links Úteis

- [Supabase Dashboard](https://supabase.com/dashboard) (use as credenciais acima)
- [Supabase JS Client Docs](https://supabase.com/docs/reference/javascript)
- [Storage API Docs](https://supabase.com/docs/guides/storage)
