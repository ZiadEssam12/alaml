import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import ProductCard from "../ProductCard/ProductCard";

export default async function ProductsList({ data }) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-base font-bold mb-4">أحدث المنتجات</h2>
      </div>
      <Carousel autoPlay autoPlayDelay={"10000"}>
        <CarouselContent className="items-stretch">
          {data.map((product) => (
            <CarouselItem
              key={product.id}
              className="md:basis-1/2 lg:basis-1/5"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </>
  );
}
