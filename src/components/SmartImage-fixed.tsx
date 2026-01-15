// SmartImage Component - No Broken Images
import React, { useState, useEffect } from 'react';
import { Skeleton } from './Skeleton';

interface SmartImageProps {
  src?: string | string[];
  alt: string;
  className?: string;
  fallback?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  priority?: boolean;
  onClick?: () => void;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  fallback,
  aspectRatio = 'square',
  priority = false,
  onClick
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  const imageArray = Array.isArray(src) ? src : src ? [src] : [];
  const totalImages = imageArray.length;

  // Default placeholder URLs based on aspect ratio
  const getDefaultPlaceholder = (): string => {
    const width = aspectRatio === 'landscape' ? 400 : 300;
    const height = aspectRatio === 'landscape' ? 225 : 300;
    return `https://picsum.photos/${width}/${height}?random=${Math.random()}`;
  };

  const getPlaceholderUrl = (): string => {
    if (fallback) return fallback;
    return getDefaultPlaceholder();
  };

  useEffect(() => {
    if (totalImages > 0) {
      setCurrentSrc(imageArray[imageIndex] || getPlaceholderUrl());
    } else {
      setCurrentSrc(getPlaceholderUrl());
    }
  }, [src, imageIndex, totalImages]);

  const handleImageLoad = (): void => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleImageError = (): void => {
    setIsLoading(false);
    setHasError(true);
    
    // Try next image in array if available
    if (totalImages > 1 && imageIndex < totalImages - 1) {
      setImageIndex(prev => prev + 1);
    }
  };

  const getAspectRatioClass = (): string => {
    switch (aspectRatio) {
      case 'video': return 'aspect-video';
      case 'portrait': return 'aspect-portrait';
      case 'landscape': return 'aspect-landscape';
      default: return 'aspect-square';
    }
  };

  const getContainerClass = (): string => {
    const baseClass = 'relative overflow-hidden bg-gray-100';
    const aspectClass = getAspectRatioClass();
    return `${baseClass} ${aspectClass} ${className}`;
  };

  if (isLoading && !currentSrc) {
    return (
      <div className={getContainerClass()}>
        <Skeleton variant="image" />
      </div>
    );
  }

  return (
    <div className={getContainerClass()} onClick={onClick}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Skeleton variant="image" />
        </div>
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-gray-400 mb-2">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586 1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">Image not available</p>
          </div>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
      
      {/* Image navigation for galleries */}
      {totalImages > 1 && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setImageIndex(prev => Math.max(0, prev - 1));
            }}
            disabled={imageIndex === 0}
            className="bg-black/50 text-white p-1 rounded hover:bg-black/70 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              setImageIndex(prev => Math.min(totalImages - 1, prev + 1));
            }}
            disabled={imageIndex === totalImages - 1}
            className="bg-black/50 text-white p-1 rounded hover:bg-black/70 disabled:opacity-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
