import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fetchPortfolioProject } from "@/hooks/usePortfolioApi";
import WavesBackground from "@/components/WavesBackground";
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

      <div className="fixed inset-0 overflow-y-auto">
        {/* Background - Solid Gray with GSAP Animated Waves */}
        <div className="fixed inset-0 -z-10 bg-background overflow-hidden">
          <WavesBackground 
            numWaves={15} 
            amplitude={40} 
            frequency={0.005}
            speed={0.006}
            opacity={0.4}
          />
        </div>
      

        {/* Logo */}
        <Link to="/portfolio" className="fixed top-8 left-8 h-14 md:h-16 overflow-hidden flex items-center z-10">
          <img src={logoLight} alt="Rodaxe" className="h-36 md:h-44 w-auto object-cover object-center -my-10" />
        </Link>

        {/* Content */}
        <div className="min-h-screen flex flex-col items-center justify-center text-white p-8">
          {/* Project Info - Starts centered, moves up */}
          <motion.div 
            className="text-center w-full max-w-5xl"
            initial={{ y: "20vh" }}
            animate={{ y: 0 }}
            transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="font-display text-3xl md:text-5xl tracking-[0.2em] uppercase font-light mb-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {project.title}
            </motion.h1>
            {project.location && (
              <motion.p 
                className="text-base md:text-lg tracking-[0.15em] uppercase text-white/80 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {project.location}
              </motion.p>
            )}
            {project.description && (
              <motion.p 
                className="text-white/70 max-w-lg mx-auto text-sm md:text-base"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {project.description}
              </motion.p>
            )}
          </motion.div>

          {/* Main Video - Fades in after text moves up */}
          {project.main_video_url && (
            <motion.div
              className="w-full max-w-4xl px-8 mt-10"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.3, duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <video
                  src={project.main_video_url}
                  controls
                  playsInline
                  poster={project.cover_image_url}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectCoverPage;
