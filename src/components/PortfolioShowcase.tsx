import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { usePortfolioProjects } from "@/hooks/usePortfolioApi";
import { usePrefetchPortfolio } from "@/hooks/usePrefetchPortfolio";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Play, ArrowRight, MapPin } from "lucide-react";

const PortfolioShowcase = memo(() => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { prefetchProject } = usePrefetchPortfolio();
  
  const { data: projects, isLoading, error } = usePortfolioProjects();

  // Show only first 4 projects
  const showcaseProjects = projects?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <section id="portfolio" className="py-32 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
              Nosso Trabalho
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-foreground">
              Explore o <span className="text-primary font-medium">Portfólio</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video rounded-2xl bg-card/50 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || showcaseProjects.length === 0) {
    return (
      <section id="portfolio" className="py-32 bg-card/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
              Nosso Trabalho
            </p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-4">
              Explore o <span className="text-primary font-medium">Portfólio</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Especializados em captação aérea para o mercado imobiliário.
              Navegue pelos nossos projetos e descubra como valorizamos cada propriedade.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-105"
            >
              Ver Portfolio Completo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="portfolio" className="py-32 bg-card/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[0.3em] text-primary mb-4 font-medium uppercase">
            Nosso Trabalho
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-foreground mb-4">
            Explore o <span className="text-primary font-medium">Portfólio</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Especializados em captação aérea para o mercado imobiliário.
            Cada projeto é único e conta uma história visual memorável.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {showcaseProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={`/portfolio/${project.slug}`}
                className="group relative block aspect-video rounded-2xl overflow-hidden border border-border/30"
                onMouseEnter={() => {
                  setHoveredId(project.id);
                  prefetchProject(project.slug);
                }}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Thumbnail */}
                <OptimizedImage
                  src={project.cover_image_url}
                  alt={`Projeto ${project.title} - Captação aérea em ${project.location || 'Brasil'}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  width={800}
                  height={450}
                  quality={75}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Play button */}
                {project.main_video_url && (
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                    hoveredId === project.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/30">
                      <Play className="w-6 h-6 text-primary-foreground ml-1" fill="currentColor" />
                    </div>
                  </div>
                )}
                
                {/* Project info */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-display text-xl md:text-2xl font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  {project.location && (
                    <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {project.location}
                    </p>
                  )}
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-105"
          >
            Ver Portfolio Completo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

PortfolioShowcase.displayName = "PortfolioShowcase";

export default PortfolioShowcase;
