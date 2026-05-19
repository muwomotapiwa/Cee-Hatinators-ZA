import { SafeImage } from './SafeImage';

interface ProductColorImageProps {
  src: string;
  alt: string;
  color?: string;
  className?: string;
  imageClassName?: string;
}

export function ProductColorImage({
  src,
  alt,
  color,
  className = '',
  imageClassName = '',
}: ProductColorImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <SafeImage src={src} alt={alt} className={`w-full h-full object-cover ${imageClassName}`} />
      {color && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: color, mixBlendMode: 'color', opacity: 0.72 }}
        />
      )}
    </div>
  );
}
