import { X } from "lucide-react";
import { useEffect } from "react";

interface Video {
  id: string | number;
  title: string;
  description: string | null;
  video_url: string;
  niches: { id: string | number; name: string }[];
  tags: { id: string | number; name: string }[];
}

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

const VideoModal = ({ video, onClose }: VideoModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-5xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={28} />
        </button>

        {/* Video Player */}
        <div className="aspect-video bg-card rounded-sm overflow-hidden shadow-2xl">
          <video
            src={video.video_url}
            className="w-full h-full"
            controls
            autoPlay
          />
        </div>

        {/* Video Info */}
        <div className="mt-6 text-center">
          <h3 className="font-display text-2xl text-foreground mb-2">
            {video.title}
          </h3>
          <p className="text-muted-foreground mb-4">{video.description}</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {video.niches?.map((niche) => (
              <span
                key={niche.id}
                className="text-sm border border-border px-3 py-1 rounded-sm text-muted-foreground"
              >
                {niche.name}
              </span>
            ))}
            {video.tags?.map((tag) => (
              <span
                key={tag.id}
                className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
