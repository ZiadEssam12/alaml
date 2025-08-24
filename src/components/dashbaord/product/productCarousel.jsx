"use client";

import { useState, useEffect } from "react";

import Image from "next/image";
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

  if (!displayProduct || !displayProduct.imageUrls) return null;

  return (
    <>
      <Carousel className="w-full" setApi={setEmblaApi}>
        <CarouselContent>
          {displayProduct.responsiveImageUrls.map((img, i) => (
            <CarouselItem key={i} className="w-full h-full">
              <div className="relative w-full h-[400px]">
                <Image
                  src={img.large}
                  alt={`${displayProduct.name} صورة ${i + 1}`}
                  fill
                  priority={i === 0}
                  placeholder="blur" // Enable blur placeholder
                  blurDataURL={img.placeholder} // Blurry placeholder
                  className="rounded-lg object-contain"
                  sizes="100vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
      <div className="flex gap-2 mt-4">
        {displayProduct.responsiveImageUrls.map((img, i) => (
          <button
            key={i}
            onClick={() => handleThumbnailClick(i)}
            className={`border rounded ${
              selectedIndex === i
                ? "border-primary ring-2 ring-primary"
                : "border-gray-300"
            }`}
            style={{ padding: 0, background: "none" }}
            aria-label={`عرض صورة ${i + 1}`}
          >
            <Image
              src={img.thumbnail}
              alt={`${displayProduct.name} صورة ${i + 1}`}
              width={80}
              height={80}
              className="rounded object-cover"
              placeholder="blur" // Enable blur placeholder
              blurDataURL={img.placeholder} // Blurry placeholder
              priority={i === 0}
            />
          </button>
        ))}
      </div>
    </>
  );
}
