
# Plano de Otimização de Performance - Rodaxe Website

## Visao Geral

Este plano implementa uma serie de otimizacoes focadas em reduzir o tempo de carregamento em 40-50% e melhorar a experiencia do usuario, especialmente em conexoes moveis.

---

## Fase 1: Componente de Imagem Otimizada

### Arquivo Novo: `src/components/OptimizedImage.tsx`

Criar um componente reutilizavel que:
- Exibe um placeholder blur enquanto a imagem carrega
- Transicao suave quando a imagem fica pronta
- Suporta parametros de otimizacao (width, quality, format)
- Aplica lazy loading automatico

```text
+----------------------------------+
|   OptimizedImage Component       |
+----------------------------------+
|  - placeholder blur (bg-muted)   |
|  - onLoad transition             |
|  - loading="lazy" por padrao     |
|  - priority para Above The Fold  |
+----------------------------------+
```

### Propriedades do Componente:
- `src`: URL da imagem
- `alt`: Texto alternativo
- `width` / `height`: Dimensoes
- `className`: Classes CSS
- `priority`: Se true, carrega imediatamente (sem lazy)
- `quality`: Qualidade da imagem (padrao 75)

---

## Fase 2: Hook de Pre-fetching

### Arquivo Novo: `src/hooks/usePrefetchPortfolio.ts`

Criar um hook que pre-carrega dados quando o usuario passa o mouse sobre um projeto:

```text
Usuario passa mouse      Dados ja em cache
sobre projeto       -->  quando clica
     |                        |
     v                        v
prefetchProject()       Navegacao instantanea
```

### Funcoes do Hook:
- `prefetchProject(slug)`: Pre-carrega dados do projeto
- `prefetchMedia(projectId)`: Pre-carrega midias do projeto

---

## Fase 3: Configuracao Otimizada do React Query

### Arquivo: `src/App.tsx`

Atualizar o QueryClient com configuracoes otimizadas para dados estaticos:

| Configuracao | Valor Atual | Valor Novo |
|--------------|-------------|------------|
| staleTime | padrao (0) | 30 minutos |
| gcTime | padrao (5min) | 1 hora |
| refetchOnWindowFocus | true | false |
| refetchOnMount | true | false |
| retry | 3 | 2 |

---

## Fase 4: Atualizacao da API de Portfolio

### Arquivo: `src/hooks/usePortfolioApi.ts`

Adicionar hooks customizados com React Query integrado:

```text
// Funcoes exportadas:
- fetchPortfolioProjects() (existente)
- fetchPortfolioProject(slug) (existente)
- fetchPortfolioMedia(projectId) (existente)

// Novos hooks:
- usePortfolioProjects()
- usePortfolioProject(slug)
- usePortfolioMedia(projectId)
```

Beneficios:
- Cache otimizado por tipo de dados
- Configuracoes de staleTime e gcTime padronizadas
- Facilita o pre-fetching

---

## Fase 5: Atualizacao dos Componentes

### 5.1 PortfolioShowcase.tsx

Alteracoes:
1. Importar e usar `OptimizedImage` no lugar de `<img>`
2. Importar e usar `usePrefetchPortfolio`
3. Adicionar pre-fetch no `onMouseEnter` dos cards

```text
<Link onMouseEnter={() => {
  setHoveredId(project.id);
  prefetchProject(project.slug);  // NOVO
}}>
  <OptimizedImage ... />           // ATUALIZADO
</Link>
```

### 5.2 PortfolioPage.tsx

Alteracoes:
1. Usar `OptimizedImage` nos thumbnails
2. Adicionar pre-fetch no hover dos projetos
3. Usar o novo hook `usePortfolioProjects()`

### 5.3 ProjectCoverPage.tsx

Alteracoes:
1. Usar `OptimizedImage` para o poster
2. Adicionar `preload="none"` ao video
3. Usar o novo hook `usePortfolioProject(slug)`

### 5.4 ProjectGalleryPage.tsx

Alteracoes:
1. Usar `OptimizedImage` na galeria
2. Adicionar `preload="none"` aos videos do lightbox
3. Usar os novos hooks `usePortfolioProject` e `usePortfolioMedia`

---

## Resumo das Alteracoes por Arquivo

| Arquivo | Acao |
|---------|------|
| `src/components/OptimizedImage.tsx` | CRIAR |
| `src/hooks/usePrefetchPortfolio.ts` | CRIAR |
| `src/hooks/usePortfolioApi.ts` | ATUALIZAR - adicionar hooks |
| `src/App.tsx` | ATUALIZAR - QueryClient otimizado |
| `src/components/PortfolioShowcase.tsx` | ATUALIZAR - OptimizedImage + prefetch |
| `src/pages/portfolio/PortfolioPage.tsx` | ATUALIZAR - OptimizedImage + prefetch |
| `src/pages/portfolio/ProjectCoverPage.tsx` | ATUALIZAR - OptimizedImage + video lazy |
| `src/pages/portfolio/ProjectGalleryPage.tsx` | ATUALIZAR - OptimizedImage + video lazy |

---

## Metricas Esperadas Apos Implementacao

| Metrica | Antes (Estimado) | Depois (Esperado) |
|---------|------------------|-------------------|
| First Contentful Paint | ~3s | < 2s |
| Largest Contentful Paint | ~5s | < 3s |
| Cumulative Layout Shift | ~0.2 | < 0.1 |
| Time to Interactive | ~6s | < 4s |
| Lighthouse Performance | ~60 | > 85 |

---

## Detalhes Tecnicos

### Regras de Qualidade de Imagem por Contexto:
- **Listagem**: width=600, quality=70
- **Showcase**: width=800, quality=75
- **Pagina Interna**: width=1920, quality=80
- **Poster de Video**: width=1920, quality=80

### Proporcoes de Aspecto:
- **Listagem**: aspect-[4/3]
- **Showcase/Video**: aspect-video (16:9)
- **Galeria**: aspect-[4/3]

### Configuracao de Cache:
- **staleTime**: 30 minutos (dados do portfolio sao estaticos)
- **gcTime**: 1 hora (manter em cache por mais tempo)
- **refetchOnWindowFocus**: false (nao refetch ao voltar para a aba)
- **refetchOnMount**: false (usar cache existente)
