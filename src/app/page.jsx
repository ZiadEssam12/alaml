import ProductCard from "@/components/ProductCard";
import Hero from "../components/Home/Hero";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function Home() {
  return (
    <>
      <main>
        <section>
          <Hero />
        </section>

        <section>
          <Carousel autoPlay autoPlayDelay={"10000"}>
            <CarouselContent>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                <ProductCard />
              </CarouselItem>
              <CarouselItem className="md:basis-1/2 lg:basis-1/3">
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
