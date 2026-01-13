import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

interface Niche {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  featured_image_url?: string | null;
  video_count?: number;
}

interface NicheCardProps {
  niche: Niche;
  index: number;
}

const NicheCard = ({ niche, index }: NicheCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Link
        to={`/niche/${niche.slug}`}
        className="group relative block overflow-hidden rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all duration-500"
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {niche.featured_image_url ? (
            <motion.img
              src={niche.featured_image_url}
              alt={niche.name}
              className="absolute inset-0 w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Sem imagem</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Arrow Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-foreground/10 backdrop-blur-sm border border-foreground/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <ArrowUpRight size={18} className="text-foreground" />
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl md:text-2xl font-medium text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                {niche.name}
              </h3>
              {niche.description && (
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {niche.description}
                </p>
              )}
            </div>
            
            {/* Video count badge */}
            <div className="shrink-0 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              {niche.video_count} {niche.video_count === 1 ? 'vídeo' : 'vídeos'}
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>
    </motion.div>
  );
};

export default NicheCard;
