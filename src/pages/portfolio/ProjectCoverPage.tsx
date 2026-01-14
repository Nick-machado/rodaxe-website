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
        {/* Background Video or Image */}
        {project.cover_video_url ? (
          <video
            src={project.cover_video_url}
            muted
            loop
            autoPlay
            playsInline
            poster={project.cover_image_url}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={project.cover_image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
          <Link to="/portfolio" className="absolute top-8 left-8 h-14 md:h-16 overflow-hidden flex items-center">
            <img src={logoLight} alt="Rodaxe" className="h-36 md:h-44 w-auto object-cover object-center -my-10" />
          </Link>

          <div className="text-center w-full max-w-5xl">
            {/* Main Video */}
            {project.main_video_url ? (
              <div className="mb-8">
                <video
                  src={project.main_video_url}
                  controls
                  playsInline
                  poster={project.cover_image_url}
                  className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
                />
              </div>
            ) : null}

            {/* Project Info */}
            <h1 className="font-display text-3xl md:text-5xl tracking-[0.2em] uppercase font-light mb-3">
              {project.title}
            </h1>
            {project.location && (
              <p className="text-base md:text-lg tracking-[0.15em] uppercase text-white/80 mb-4">
                {project.location}
              </p>
            )}
            {project.description && (
              <p className="text-white/70 max-w-lg mx-auto text-sm md:text-base">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectCoverPage;
