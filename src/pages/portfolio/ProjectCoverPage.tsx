import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { fetchPortfolioProject } from "@/hooks/usePortfolioApi";
import logoLight from "@/assets/logo-rodaxe-light.png";

const ProjectCoverPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ["portfolio-project", slug],
    queryFn: () => fetchPortfolioProject(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
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
        {/* Cover Image */}
        <img
          src={project.cover_image_url}
          alt={project.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
          <Link to="/portfolio" className="absolute top-8 left-8">
            <img src={logoLight} alt="Rodaxe" className="h-12 invert" />
          </Link>

          <div className="text-center max-w-2xl">
            <h1 className="font-display text-4xl md:text-6xl tracking-[0.2em] uppercase font-light mb-4">
              {project.title}
            </h1>
            {project.location && (
              <p className="text-lg md:text-xl tracking-[0.15em] uppercase text-white/80 mb-6">
                {project.location}
              </p>
            )}
            {project.description && (
              <p className="text-white/70 mb-8 max-w-lg mx-auto">
                {project.description}
              </p>
            )}
            <Button
              onClick={() => navigate(`/portfolio/${slug}/gallery`)}
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black transition-all"
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
