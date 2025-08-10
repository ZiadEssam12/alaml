import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import ProductCard from "../ProductCard/ProductCard";

export default async function ProductsList() {
  const products = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/product`);
  const { data: productsList } = await products.json();
  return (
    <Carousel autoPlay autoPlayDelay={"10000"}>
      <CarouselContent className="items-stretch">
        {productsList.map((product) => (
          <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/5">
            {console.log("product:", product)}
            <ProductCard product={product} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext />
      <CarouselPrevious />
    </Carousel>
  );
}
