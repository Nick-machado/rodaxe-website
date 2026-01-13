import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search, Globe, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import logoLight from "@/assets/logo-rodaxe-light.png";

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  cover_image_url: string;
  project_date: string | null;
  is_published: boolean;
}

const PortfolioPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 18;

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["portfolio-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("is_published", true)
        .order("project_date", { ascending: false });

      if (error) throw error;
      return data as PortfolioProject[];
    },
  });

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const formatProjectDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM, yyyy", { locale: pt }).toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>Portfolio | Rodaxe</title>
        <meta name="description" content="Explore nosso portfolio de projetos de filmagem aérea e fotografia profissional." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <Youtube size={18} />
                </a>
              </div>

              {/* Search */}
              <div className="relative">
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <Search size={20} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4">
            {/* Logo & Info */}
            <div className="text-center mb-12">
              <Link to="/" className="inline-block mb-6">
                <img src={logoLight} alt="Rodaxe" className="h-16 mx-auto dark:invert" />
              </Link>
              
              <p className="text-muted-foreground mb-6 text-sm">
                Capturamos momentos únicos através de filmagens aéreas profissionais.
              </p>

              <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                <a href="https://rodaxe.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Globe size={16} />
                  rodaxe.com
                </a>
                <a href="tel:+351910000000" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone size={16} />
                  +351 910 000 000
                </a>
                <a href="mailto:info@rodaxe.com" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail size={16} />
                  info@rodaxe.com
                </a>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-md mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                  type="text"
                  placeholder="Pesquisar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            ) : paginatedProjects.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/portfolio/${project.slug}`}
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-lg transition-colors pointer-events-none" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-display text-sm tracking-[0.15em] uppercase font-medium text-foreground group-hover:text-primary transition-colors">
                        {project.title}
                        {project.location && ` - ${project.location}`}
                      </h3>
                      {project.project_date && (
                        <p className="text-xs text-muted-foreground mt-1 tracking-wider">
                          {formatProjectDate(project.project_date)}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === i + 1
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <Link to="/termos" className="hover:text-primary transition-colors">
                Termos de Serviço
              </Link>
              <Link to="/privacidade" className="hover:text-primary transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default PortfolioPage;
