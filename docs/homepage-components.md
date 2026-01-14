# Documentação: Componentes da Página Principal

Esta documentação detalha como é composta a página principal e como cada componente funciona, incluindo bibliotecas utilizadas, estrutura, estilos e animações.

## Composição Geral

- Arquivo de entrada: [src/pages/Index.tsx](../src/pages/Index.tsx)
- Ordem dos componentes renderizados:
  1. [Navbar](../src/components/Navbar.tsx)
  2. [HeroSection](../src/components/HeroSection.tsx)
  3. [ServicesSection](../src/components/ServicesSection.tsx)
  4. [NichesGrid](../src/components/NichesGrid.tsx)
  5. [AboutSection](../src/components/AboutSection.tsx)
  6. [PartnersMarquee](../src/components/PartnersMarquee.tsx)
  7. [ContactSection](../src/components/ContactSection.tsx)

Cada seção utiliza Tailwind CSS para estilização e, quando necessário, bibliotecas de animação.

---

## Navbar
- Arquivo: [src/components/Navbar.tsx](../src/components/Navbar.tsx)
- Propósito: Navegação fixa no topo, com links de páginas/seções e um CTA.
- Bibliotecas:
  - `react-router-dom` para navegação (`Link`).
  - `framer-motion` para animações de entrada e hover.
  - `lucide-react` para ícones (Menu, X, ArrowDown).
- Estrutura:
  - Logo animado (hover com leve escala).
  - Menu desktop em formato pill com links: HOME (`/`), PORTFÓLIO (`/portfolio`), SERVIÇOS (`/#services`), SOBRE (`/#about`).
  - CTA "FALE CONOSCO" que rola até a seção de contato.
  - Menu mobile com `AnimatePresence` (abre/fecha e anima altura/opacidade).
- Comportamento:
  - Estado `isScrolled` altera fundo, blur e borda ao rolar (maior legibilidade).
  - No mobile, clique em links fecha o menu e pode rolar até a seção.

---

## HeroSection
- Arquivo: [src/components/HeroSection.tsx](../src/components/HeroSection.tsx)
- Propósito: Cabeçalho visual com headline, CTAs e um cartão de mídia (imagem de capa/"vídeo").
- Bibliotecas:
  - `framer-motion` para animar headline, CTAs e textos sobrepostos.
  - `lucide-react` (`ArrowDown`).
- Estrutura:
  - Fundo decorativo com linhas curvas em SVG e baixa opacidade.
  - Headline principal com destaques em `text-primary`.
  - Dois CTAs: botão textual e botão circular com seta (efeitos de hover/rotate).
  - Card de mídia com imagem (`heroImage`), overlay gradiente, texto "Rodaxe / Audiovisual" e indicador de "play" ao hover.
- Animações:
  - Variants para fade + translate dos elementos na entrada.
  - Efeitos de hover nos botões (scale, rotate da seta).

---

## ServicesSection
- Arquivo: [src/components/ServicesSection.tsx](../src/components/ServicesSection.tsx)
- Propósito: Apresentar serviços com uma experiência de rolagem (desktop) e cards simples (mobile).
- Bibliotecas:
  - `gsap` + `gsap/ScrollTrigger` para animações baseadas em scroll no desktop.
  - `useIsMobile` (hook interno) para renderização condicional.
  - `lucide-react` para ícones dos serviços.
- Dados base:
  - Array `services` com `{ icon, title, description, number }`.
- Estrutura (mobile):
  - Seção simples com título, e uma grade de cards com ícone, título e descrição.
- Estrutura (desktop):
  - Container `sticky` de tela inteira com perspectiva 3D (`perspective`).
  - Múltiplos "cards" empilhados; conforme o scroll, o card atual entra em foco e os anteriores saem com transformações 3D.
- Animações (desktop):
  - `ScrollTrigger.create` calcula `progress` e aplica transformações (scale, yPercent, rotateX) em cada card para entrada/saída.
  - A lógica utiliza `transitionPercent` derivado do número de cards para fases de animação.
- Observações:
  - O texto gigante de fundo "SERVIÇOS" e seu efeito parallax foram removidos conforme solicitação.
  - ID de âncora: `id="services"` para navegação via Navbar.

---

## NichesGrid
- Arquivo: [src/components/NichesGrid.tsx](../src/components/NichesGrid.tsx)
- Propósito: Apresentar o portfólio/nichos com um convite para ver a página completa.
- Bibliotecas:
  - `framer-motion` para animação de entrada ao entrar na viewport.
  - `react-router-dom` (`Link`) para navegar até `/portfolio`.
- Estrutura:
  - Cabeçalho com título e descrição.
  - CTA "Ver Portfolio Completo" que leva à página de portfólio.
  - `niches` é um placeholder que será populado por um sistema admin/banco de dados.
- ID de âncora: `id="niches"`.

---

## AboutSection
- Arquivo: [src/components/AboutSection.tsx](../src/components/AboutSection.tsx)
- Propósito: Explicar posicionamento da empresa e exibir métricas (stats).
- Bibliotecas:
  - `framer-motion` para animar o conteúdo e cada item de stat.
  - `lucide-react` para ícones de stats.
- Estrutura:
  - Fundo decorativo com gradiente sutil.
  - Título e parágrafos descrevendo missão e diferenciais.
  - Grid de stats (Projetos, Clientes, Anos, Suporte), cada um com ícone e valores.
- Animações:
  - Entrada suave do conteúdo; cada stat tem delay incremental.
- ID de âncora: `id="about"`.

---

## PartnersMarquee
- Arquivo: [src/components/PartnersMarquee.tsx](../src/components/PartnersMarquee.tsx)
- Propósito: Exibir marcas/parceiros em rolagem contínua horizontal (marquee).
- Bibliotecas:
  - CSS `@keyframes` para animação de deslocamento da track.
- Estrutura:
  - Track duplicada de logos para loop infinito (primeiro set + duplicado).
  - Gradientes nas laterais para suavizar entrada/saída visual.
  - Filtro nos logos (grayscale/invert/brightness) para harmonizar no tema escuro.
- Comportamento:
  - Pausa da animação ao hover.

---

## ContactSection
- Arquivo: [src/components/ContactSection.tsx](../src/components/ContactSection.tsx)
- Propósito: Informações de contato, redes sociais e formulário de mensagem.
- Bibliotecas:
  - `framer-motion` para animações de entrada e hover.
  - Componentes de UI locais: [src/components/ui/button.tsx](../src/components/ui/button.tsx), [src/components/ui/input.tsx](../src/components/ui/input.tsx), [src/components/ui/textarea.tsx](../src/components/ui/textarea.tsx).
  - `sonner` para exibir `toast` de sucesso no envio.
  - `lucide-react` para ícones (Mail, Phone, MapPin, Instagram, etc.).
- Estrutura:
  - Layout em grid (título + cartões de contato à esquerda; formulário à direita).
  - Cartões clicáveis com ícones e link (mailto/tel/local).
  - Formulário com campos básicos; simulação de envio assíncrono e `toast`.
  - Rodapé com menu de âncoras, redes sociais e copyright.
- ID de âncora: `id="contact"`.

---

## Convenções de Estilo
- Tailwind com tokens temáticos: `bg-background`, `text-foreground`, `border-border`, `text-primary`, etc.
- Tipografia: `font-display` para títulos; espaçamento e tracking ajustados.
- Tema escuro predominante com transparências (`/10`–`/50`) e `backdrop-blur` em elementos destacados.

## Navegação por Âncoras
- IDs utilizados na página para navegação: `#services`, `#niches`, `#about`, `#contact`.
- A `Navbar` utiliza esses IDs em seus links para rolar suavemente até as seções.

## Observações e Próximos Passos
- `NichesGrid` está preparado para receber dados do backend/admin.
- A seção de serviços já está adaptada ao pedido (sem texto gigante de fundo).
- Possíveis melhorias: padronização de idioma (ex.: manter português em todos os títulos), ajustes finos de opacidade e tempo de animação conforme preferências.
