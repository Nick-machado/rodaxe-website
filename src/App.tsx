import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Componente de fallback para o Suspense
const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Importações dinâmicas das páginas com React.lazy
const Index = React.lazy(() => import("./pages/Index"));
const NichePage = React.lazy(() => import("./pages/NichePage"));
const PublicLink = React.lazy(() => import("./pages/PublicLink"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Portfolio public pages
const PortfolioPage = React.lazy(() => import("./pages/portfolio/PortfolioPage"));
const ProjectCoverPage = React.lazy(() => import("./pages/portfolio/ProjectCoverPage"));
const ProjectGalleryPage = React.lazy(() => import("./pages/portfolio/ProjectGalleryPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes - portfolio data is mostly static
      gcTime: 1000 * 60 * 60, // 1 hour - keep in cache longer
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/niche/:slug" element={<NichePage />} />
              <Route path="/link/:token" element={<PublicLink />} />

              {/* Portfolio Public Routes */}
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/portfolio/:slug" element={<ProjectCoverPage />} />
              <Route path="/portfolio/:slug/gallery" element={<ProjectGalleryPage />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
