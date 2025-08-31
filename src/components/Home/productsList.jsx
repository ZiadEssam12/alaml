import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import ProductCard from "../ProductCard/ProductCard";

export default async function ProductsList({ title = "أحدث المنتجات", data }) {
  return (
    <>
      <div className="mb-3">
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <Carousel autoPlay autoPlayDelay={"10000"}>
        <CarouselContent className="items-stretch">
          {data.map((product) => (
            <CarouselItem
              key={product.id}
              className="md:basis-1/2 lg:basis-1/4"
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
