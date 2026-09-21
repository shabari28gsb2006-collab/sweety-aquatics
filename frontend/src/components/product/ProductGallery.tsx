import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=1000&q=80'];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div id="product-gallery-container" className="space-y-4">
      {/* Primary Display Stage */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-[#F5FCFF] border border-sky-100 shadow-sm group">
        <img
          src={galleryImages[activeIndex]}
          alt={`${productName} view ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Carousel controls for multi-image */}
        {galleryImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center shadow-md backdrop-blur-xs transition-transform active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Mobile Pagination Dots */}
        {galleryImages.length > 1 && (
          <div className="sm:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {galleryImages.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeIndex ? 'bg-[#50D4EE] w-5' : 'bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails (Mobile & Desktop) */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                idx === activeIndex
                  ? 'border-[#0875B5] ring-2 ring-[#0875B5]/30'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
