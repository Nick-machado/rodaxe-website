import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Niche } from "@/lib/mockData";

interface NicheCardProps {
  niche: Niche;
  index: number;
}

const NicheCard = ({ niche, index }: NicheCardProps) => {
  return (
    <Link
      to={`/niche/${niche.slug}`}
      className="group relative aspect-[4/5] overflow-hidden rounded-lg card-hover block bg-card border border-border"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      {niche.featured_image_url ? (
        <img
          src={niche.featured_image_url}
          alt={niche.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
          <span className="text-muted-foreground text-sm">Sem imagem</span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 video-overlay opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <p className="cinematic-text text-xs text-primary tracking-widest mb-2 font-medium">
            {niche.video_count} {niche.video_count === 1 ? 'vídeo' : 'vídeos'}
          </p>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {niche.name}
          </h3>
          <p className="text-muted-foreground text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-2">
            {niche.description}
          </p>
        </div>

        {/* Arrow */}
        <div className="absolute top-6 right-6 w-10 h-10 rounded-full border border-foreground/30 flex items-center justify-center text-foreground opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:border-primary group-hover:text-primary">
          <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default NicheCard;
