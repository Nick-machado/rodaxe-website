import { Play } from "lucide-react";

interface Video {
  id: string | number;
  title: string;
  description?: string | null;
  thumbnail_url: string;
  video_url?: string;
  niches?: { id: string | number; name: string }[];
  tags?: { id: string | number; name: string }[];
  created_at?: string;
}

interface VideoCardProps {
  video: Video;
  onClick: () => void;
}

const VideoCard = ({ video, onClick }: VideoCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-video overflow-hidden rounded-sm card-hover w-full text-left"
    >
      {/* Thumbnail */}
      {video.thumbnail_url ? (
        <img
          src={video.thumbnail_url}
          alt={video.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-muted flex items-center justify-center">
          <Play size={32} className="text-muted-foreground" />
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/30 group-hover:bg-background/50 transition-colors duration-500" />

      {/* Play Button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-foreground/50 flex items-center justify-center text-foreground group-hover:border-primary group-hover:text-primary group-hover:scale-110 transition-all duration-500 bg-background/20 backdrop-blur-sm">
          <Play size={24} fill="currentColor" className="ml-1" />
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 video-overlay">
        <h3 className="font-display text-lg text-foreground mb-1 line-clamp-1">
          {video.title}
        </h3>
        <div className="flex gap-2 flex-wrap">
          {video.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-sm"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

export default VideoCard;
