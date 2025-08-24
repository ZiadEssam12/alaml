"use client";

import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";

// Use completely different placeholder services
const images = [
  "/stationery-1.jpg",
  "/stationery-2.jpg",
  "/stationery-3.jpg",
  "/stationery-4.webp",
];
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <>
      <div className="relative">
        <Carousel loop={true}>
          <CarouselContent className="h-96">
            <CarouselItem>
              <div className="relative w-full h-full ">
                <Image
                  src={images[0]}
                  alt="Stationery Item 1"
                  fill
                  priority
                  className="object-cover rounded-lg"
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative w-full h-full ">
                <Image
                  src={images[1]}
                  alt="Stationery Item 2"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative w-full h-full ">
                <Image
                  src={images[2]}
                  alt="Stationery Item 3"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </CarouselItem>
            <CarouselItem>
              <div className="relative w-full h-full">
                <Image
                  src={images[3]}
                  alt="Stationery Item 4"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselNext />
          <CarouselPrevious />
        </Carousel>

        {/* Styled as shadcn button */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="font-semibold rounded-full dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-colors"
          >
            <Link href="/products">تصفح المنتجات</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
