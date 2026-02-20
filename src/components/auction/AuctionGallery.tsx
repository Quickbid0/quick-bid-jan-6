import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Auction {
  id: string;
  title: string;
  images: string[];
}

interface AuctionGalleryProps {
  auction: Auction;
}

export function GalleryPanel({ auction }: AuctionGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImage = auction.images[currentImageIndex] || '/placeholder-auction.jpg';
  const imageCount = auction.images.length || 1;

  const handlePrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="space-y-4 w-full min-w-0">
      {/* Main Image */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden w-full">
        <div className="aspect-square flex items-center justify-center bg-gray-200 w-full">
          <img
            src={currentImage}
            alt={`${auction.title} - Image ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
          {currentImageIndex + 1} of {imageCount}
        </div>

        {/* Navigation Arrows - Touch targets 44x44px minimum */}
        {imageCount > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2.5 rounded-full shadow transition-all touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-2.5 rounded-full shadow transition-all touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip - Scrollable on mobile */}
      {imageCount > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0">
          {auction.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all touch-manipulation min-h-[44px] min-w-[44px] ${
                idx === currentImageIndex
                  ? 'border-blue-500 ring-2 ring-blue-300'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              aria-label={`Image ${idx + 1}`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Slideshow Controls */}
      {imageCount > 1 && (
        <div className="flex justify-center gap-3">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded font-medium transition-colors"
          >
            ◀ Previous
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded font-medium transition-colors"
          >
            Next ▶
          </button>
        </div>
      )}

      {/* Additional Info */}
      <div className="text-sm text-gray-600 text-center">
        <p>
          {imageCount} {imageCount === 1 ? 'photo' : 'photos'} available
        </p>
        <p className="text-xs mt-1">
          Use arrow keys or click thumbnails to navigate
        </p>
      </div>
    </div>
  );
}
