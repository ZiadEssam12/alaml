import ProductCard from "@/components/ProductCard/ProductCard";
import Hero from "../components/Home/Hero";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Categories from "@/components/Home/Categories";

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        <Categories />

        <section>
          <div className="mb-8">
            <h2 className="text-base  font-bold mb-4">المنتجات المقترحة</h2>
          </div>
          <Carousel autoPlay autoPlayDelay={"10000"}>
            <CarouselContent>
              <CarouselItem className="md:basis-1/2 lg:basis-1/4">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/4">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/4">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/4">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/4">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/4">
                <ProductCard />
              </CarouselItem>
            </CarouselContent>
            <CarouselNext />
            <CarouselPrevious />
          </Carousel>
        </section>
      </main>
    </>
  );
}
