import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Link from "next/link";
import DynamicIcons from "../DynamicIcons";

// // Categories data
// export const categories = [
//   {
//     id: 1,
//     name: "الكتب والدفاتر",
//     icon: BookOpen,
//     href: "/categories/books-notebooks",
//     color: "text-blue-600",
//   },
//   {
//     id: 2,
//     name: "أقلام الرصاص والحبر",
//     icon: Pencil,
//     href: "/categories/pens-pencils",
//     color: "text-green-600",
//   },
//   {
//     id: 3,
//     name: "أدوات القص واللصق",
//     icon: Scissors,
//     href: "/categories/cutting-gluing",
//     color: "text-red-600",
//   },
//   {
//     id: 4,
//     name: "الآلات الحاسبة",
//     icon: Calculator,
//     href: "/categories/calculators",
//     color: "text-purple-600",
//   },
//   {
//     id: 5,
//     name: "ألوان ومواد الرسم",
//     icon: PaintBucket,
//     href: "/categories/art-supplies",
//     color: "text-orange-600",
//   },
//   {
//     id: 6,
//     name: "أدوات القياس",
//     icon: Ruler,
//     href: "/categories/measuring-tools",
//     color: "text-teal-600",
//   },
//   {
//     id: 7,
//     name: "مشابك وحافظات",
//     icon: Paperclip,
//     href: "/categories/clips-holders",
//     color: "text-indigo-600",
//   },
//   {
//     id: 8,
//     name: "أوراق ومطبوعات",
//     icon: FileText,
//     href: "/categories/papers-prints",
//     color: "text-yellow-600",
//   },
//   {
//     id: 9,
//     name: "حقائب مدرسية",
//     icon: Briefcase,
//     href: "/categories/school-bags",
//     color: "text-pink-600",
//   },
//   {
//     id: 10,
//     name: "مستلزمات فنية",
//     icon: Palette,
//     href: "/categories/art-materials",
//     color: "text-cyan-600",
//   },
// ];

export default async function Categories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/categories`);
  let categoriesList = await res.json();
  categoriesList = categoriesList.data;

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
        <CarouselContent className="-ml-2 md:-ml-4">
          {categoriesList.map((category) => {
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
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
}
