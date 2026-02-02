import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  usePortfolioProject, 
  usePortfolioMedia, 
  PortfolioMedia 
} from "@/hooks/usePortfolioApi";
import { OptimizedImage } from "@/components/OptimizedImage";

const ProjectGalleryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedMedia, setSelectedMedia] = useState<PortfolioMedia | null>(null);

  const { data: project, isLoading: projectLoading } = usePortfolioProject(slug!);
  const { data: media = [], isLoading: mediaLoading } = usePortfolioMedia(project?.id || '');

  const isLoading = projectLoading || mediaLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <>
        <Helmet>
          <title>Galeria | Rodaxe Portfolio</title>
        </Helmet>

        <div className="min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center gap-4">
          <p className="text-white/70">Galeria não encontrada.</p>
          <Button
            onClick={() => navigate("/portfolio")}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            Voltar ao Portfolio
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{project.title} - Galeria | Rodaxe Portfolio</title>
      </Helmet>

      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                onClick={() => navigate(`/portfolio/${slug}`)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft size={20} className="mr-2" />
                Voltar
              </Button>
              <h1 className="font-display text-sm tracking-[0.15em] uppercase text-white">
                {project.title}
                {project.location && ` - ${project.location}`}
              </h1>
              <Link
                to="/portfolio"
                className="text-white/70 hover:text-white text-sm"
              >
                Portfolio
              </Link>
            </div>
          </div>
        </header>

        {/* Gallery Grid */}
        <main className="container mx-auto px-4 py-8">
          {media.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/70">Nenhuma mídia encontrada neste projeto.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedMedia(item)}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg"
                >
                  <OptimizedImage
                    src={item.type === "video" ? (item.thumbnail_url || item.url) : item.url}
                    alt={item.title || "Media"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    width={600}
                    height={450}
                    quality={70}
                  />
                  {item.type === "video" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Play size={32} className="text-white ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/30 rounded-lg transition-colors pointer-events-none" />
                </button>
              ))}
            </div>
          )}
        </main>

        {/* Lightbox */}
        {selectedMedia && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X size={32} />
            </button>
            <div
              className="max-w-5xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === "video" ? (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  preload="none"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.title || "Media"}
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
              {selectedMedia.title && (
                <p className="text-white text-center mt-4">{selectedMedia.title}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectGalleryPage;
