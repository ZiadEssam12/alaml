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
        <Hero />

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">المنتجات المقترحة</h2>
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
