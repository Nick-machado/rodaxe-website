import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NichePage from "./pages/NichePage";
import PublicLink from "./pages/PublicLink";
import NotFound from "./pages/NotFound";

// Portfolio public pages
import PortfolioPage from "./pages/portfolio/PortfolioPage";
import ProjectCoverPage from "./pages/portfolio/ProjectCoverPage";
import ProjectGalleryPage from "./pages/portfolio/ProjectGalleryPage";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
