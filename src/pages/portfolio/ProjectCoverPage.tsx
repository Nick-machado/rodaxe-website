import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-rodaxe-light.png";

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  cover_image_url: string;
  project_date: string | null;
  description: string | null;
  is_published: boolean;
}

const ProjectCoverPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading, error } = useQuery({
    queryKey: ["portfolio-project", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error) throw error;
      return data as PortfolioProject;
    },
    enabled: !!slug,
  });

  const formatProjectDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: pt });
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
        <Button onClick={() => navigate("/portfolio")} variant="outline">
          Voltar ao Portfolio
        </Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title} | Rodaxe Portfolio</title>
        <meta name="description" content={project.description || `Projeto ${project.title} - Rodaxe`} />
      </Helmet>

      <div className="fixed inset-0">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${project.cover_image_url})` }}
        >
          {/* Dark overlay with top and bottom gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />
        </div>

        {/* Top bar with date */}
        <div className="absolute top-0 left-0 right-0 p-8">
          <div className="flex items-start justify-between">
            <div>
              {project.project_date && (
                <p className="text-white/90 text-xs tracking-[0.3em] uppercase font-light">
                  {formatProjectDate(project.project_date)}
                </p>
              )}
              <div className="mt-4 w-full h-px bg-white/30" />
            </div>
          </div>
        </div>

        {/* Center content - Title */}
        <div className="absolute inset-0 flex items-center justify-start px-8 md:px-16">
          <div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-white tracking-wide">
              {project.title}
              {project.location && (
                <>
                  <span className="text-white/60"> - </span>
                  {project.location}
                </>
              )}
            </h1>
          </div>
        </div>

        {/* Bottom bar with logo and CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="w-full h-px bg-white/30 mb-8" />
          <div className="flex items-end justify-between">
            <Link to="/portfolio" className="opacity-80 hover:opacity-100 transition-opacity">
              <img src={logoLight} alt="Rodaxe" className="h-10 invert" />
            </Link>

            <Button
              onClick={() => navigate(`/portfolio/${slug}/gallery`)}
              className="bg-transparent border border-white/50 text-white hover:bg-white/10 hover:border-white px-8 py-6 text-xs tracking-[0.2em] uppercase font-medium transition-all"
            >
              Ver Galeria
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectCoverPage;
