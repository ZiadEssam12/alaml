import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Link from "next/link";
import DynamicIcons from "../DynamicIcons";

export default async function Categories({ data }) {
  return (
    <section className="mt-2">
      <div className="mb-4">
        <h2 className="text-base font-bold">تسوق بالأقسام</h2>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselPrevious />
        <CarouselNext />
        <CarouselContent>
          {data.map((category) => {
            return (
              <CarouselItem
                key={category.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/8"
              >
                <Link
                  href={`categories/${category.seoTitle}`}
                  className="group flex flex-col items-center px-4 py-1 bg-card rounded-lg border hover:shadow-md transition-all duration-200 hover:border-primary/20 h-full"
                >
                  <div
                    className={`p-3 rounded-full bg-accent/20 group-hover:bg-primary/10 transition-colors`}
                  >
                    <DynamicIcons icon={category.icon} color={category.color} />
                  </div>
                  <span className="mt-1 text-sm font-medium text-center group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </Link>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
