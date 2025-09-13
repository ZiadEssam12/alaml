"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ProductCarousel({ displayProduct }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaApi, setEmblaApi] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // When a thumbnail is clicked
  const handleThumbnailClick = (idx) => {
    setSelectedIndex(idx);
    if (emblaApi) emblaApi.scrollTo(idx);
  };

  // Listen for carousel selection changes
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) setIsZoomed(false);
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
  };

  if (!displayProduct || !displayProduct.imageUrls) return null;

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative group">
        <Carousel className="w-full" setApi={setEmblaApi}>
          <CarouselContent>
            {displayProduct.responsiveImageUrls.map((img, i) => (
              <CarouselItem key={i} className="w-full h-full">
                <div className="relative w-full h-[500px] bg-muted/20 rounded-xl overflow-hidden">
                  <Image
                    src={img.large}
                    alt={`${displayProduct.name} صورة ${i + 1}`}
                    fill
                    priority={i === 0}
                    placeholder="blur"
                    blurDataURL={img.placeholder}
                    className={`object-contain transition-transform duration-300 ${
                      isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
                    }`}
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: "center center",
                    }}
                    onClick={() => {
                      if (isZoomed) {
                        resetZoom();
                      } else {
                        handleZoomIn();
                      }
                    }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />

                  {/* Zoom Controls */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 3}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={resetZoom}
                      disabled={zoomLevel === 1}
                      className="h-8 w-8 p-0"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {i + 1} / {displayProduct.responsiveImageUrls.length}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext />
          <CarouselPrevious />
        </Carousel>
      </div>

      {/* Thumbnail Gallery */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {displayProduct.responsiveImageUrls.map((img, i) => (
          <button
            key={i}
            onClick={() => handleThumbnailClick(i)}
            className={`relative flex-shrink-0 border-2 rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 ${
              selectedIndex === i
                ? "border-primary ring-2 ring-primary/20 shadow-lg scale-105"
                : "border-muted hover:border-primary/50"
            }`}
            style={{ padding: 0, background: "none" }}
            aria-label={`عرض صورة ${i + 1}`}
          >
            <div className="relative w-20 h-20 group">
              <Image
                src={img.thumbnail}
                alt={`${displayProduct.name} صورة ${i + 1}`}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-110"
                placeholder="blur"
                blurDataURL={img.placeholder}
                priority={i === 0}
              />
              {selectedIndex === i && (
                <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Zoom Level Indicator */}
      {isZoomed && (
        <div className="text-center">
          <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            مستوى التكبير: {zoomLevel}x
          </span>
        </div>
      )}
    </div>
  );
}
