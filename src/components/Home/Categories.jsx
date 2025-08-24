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
    <section className="mt-0">
      <div className="mb-8">
        <h2 className="text-base font-bold mb-4">تسوق بالأقسام</h2>
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
        <CarouselContent className="-ml-2 md:-ml-4">
          {data.map((category) => {
            return (
              <CarouselItem
                key={category.id}
                className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/8"
              >
                <Link
                  href={`categories/${category.seoTitle}`}
                  className="group flex flex-col items-center p-4 bg-card rounded-lg border hover:shadow-md transition-all duration-200 hover:border-primary/20 h-full"
                >
                  <div
                    className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-primary/10 transition-colors ${category.color}`}
                  >
                    <DynamicIcons icon={category.icon} />
                  </div>
                  <span className="mt-2 text-sm font-medium text-center group-hover:text-primary transition-colors">
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
