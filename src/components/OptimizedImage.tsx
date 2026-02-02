import { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  quality?: number;
  format?: 'webp' | 'jpg';
}

export const OptimizedImage = ({
  src,
  alt,
  width = 800,
  height = 600,
  className,
  containerClassName,
  priority = false,
  quality = 75,
  format = 'webp',
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Add transformation parameters for Supabase Storage URLs
  const optimizedUrl = src?.includes('supabase')
    ? `${src}?width=${width}&quality=${quality}&format=${format}`
    : src;

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {/* Placeholder blur */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      <img
        src={optimizedUrl}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        className={cn(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
