import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BannerItem } from '../types';

interface HeroSliderProps {
  banners: BannerItem[];
  onNavigate?: (link: string) => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners }) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeBanners = banners.filter((b) => b.active);
  const total = activeBanners.length;

  const nextSlide = () => {
    if (total === 0) return;
    setCurrent((prev) => (prev + 1) % total);
  };

  const prevSlide = () => {
    if (total === 0) return;
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    if (total <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const currentBanner = activeBanners[current];
    const duration = (currentBanner?.slideDuration || 5) * 1000;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, duration);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current, total, isHovered, activeBanners]);

  if (total === 0) {
    return null;
  }

  return (
    <section
      id="hero-banner-slider"
      className="relative w-full overflow-hidden bg-slate-950 select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Hero Highlights Banner Slider"
    >
      {/* Slides Container - Clean Full Banner Visibility Without Cropping */}
      <div className="relative w-full aspect-[21/9] min-h-[220px] sm:min-h-[320px] md:min-h-[420px] lg:min-h-[500px] max-h-[600px] overflow-hidden bg-slate-950 flex items-center justify-center">
        {activeBanners.map((banner, index) => {
          const isActive = index === current;
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Optional subtle ambient blurred backdrop to fill letterbox smoothly */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 blur-xl scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${banner.imageUrl})` }}
              />

              {/* Crisp Uncropped Banner Image */}
              <img
                src={banner.imageUrl}
                alt={`Banner ${index + 1}`}
                referrerPolicy="no-referrer"
                className="relative z-10 max-w-full max-h-full w-full h-full object-contain object-center"
              />
            </div>
          );
        })}
      </div>

      {/* Prev / Next Controls */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white border border-white/30 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-lg"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Slide Dots Indicator */}
      {total > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/70 border border-white/20 backdrop-blur-md shadow-md">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === current ? 'w-7 bg-sky-400 shadow-sm' : 'w-2 bg-white/50 hover:bg-white/90'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
