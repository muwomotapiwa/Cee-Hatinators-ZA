import { PLACEHOLDER_IMAGES } from '../lib/imagePlaceholders';

interface SafeImageProps {
  src?: string;
  alt?: string;
  className?: string;
  title?: string;
  fallbackSrc?: string;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'auto' | 'sync';
  onError?: (event: { currentTarget: HTMLImageElement }) => void;
}

export function SafeImage({
  fallbackSrc = PLACEHOLDER_IMAGES.product,
  onError,
  ...props
}: SafeImageProps) {
  const handleError = (event: { currentTarget: HTMLImageElement }) => {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied !== 'true') {
      image.dataset.fallbackApplied = 'true';
      image.src = fallbackSrc;
    }

    onError?.(event);
  };

  return <img {...props} onError={handleError} />;
}
