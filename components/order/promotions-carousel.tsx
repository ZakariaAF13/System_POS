'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Promotion } from '@/lib/types';

interface PromotionsCarouselProps {
  promotions: Promotion[];
}

export function PromotionsCarousel({ promotions }: PromotionsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activePromotions = promotions.filter((p) => p.active);

  useEffect(() => {
    if (!isAutoPlaying || activePromotions.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePromotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, activePromotions.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) =>
      prev === 0 ? activePromotions.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % activePromotions.length);
  };

  if (activePromotions.length === 0) return null;

  return (
    <div className="relative w-full mb-6">
      <Card className="overflow-hidden">
        <div className="relative h-48 md:h-64">
          <img
            src={activePromotions[currentIndex].image}
            alt={activePromotions[currentIndex].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
            <Badge className="mb-2 bg-red-600 hover:bg-red-700">
              Diskon {activePromotions[currentIndex].discount}%
            </Badge>
            <h3 className="text-xl md:text-2xl font-bold mb-1">
              {activePromotions[currentIndex].title}
            </h3>
            <p className="text-sm md:text-base opacity-90">
              {activePromotions[currentIndex].description}
            </p>
          </div>
        </div>
      </Card>

      {activePromotions.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            aria-label="Previous promotion"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
            aria-label="Next promotion"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {activePromotions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to promotion ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
