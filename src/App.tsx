import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NichePage from "./pages/NichePage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import VideosManagement from "./pages/admin/VideosManagement";
import NichesManagement from "./pages/admin/NichesManagement";
import TagsManagement from "./pages/admin/TagsManagement";
import ClientesManagement from "./pages/admin/trabalhos/ClientesManagement";
import TrabalhosManagement from "./pages/admin/trabalhos/TrabalhosManagement";
import RelatorioPage from "./pages/admin/trabalhos/RelatorioPage";
import CalendarPage from "./pages/admin/trabalhos/CalendarPage";
import PublicLink from "./pages/PublicLink";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/niche/:slug" element={<NichePage />} />
              <Route path="/link/:token" element={<PublicLink />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="videos" element={<VideosManagement />} />
                <Route path="niches" element={<NichesManagement />} />
                <Route path="tags" element={<TagsManagement />} />
                <Route path="clientes" element={<ClientesManagement />} />
                <Route path="trabalhos" element={<TrabalhosManagement />} />
                <Route path="relatorio" element={<RelatorioPage />} />
                <Route path="calendario" element={<CalendarPage />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
