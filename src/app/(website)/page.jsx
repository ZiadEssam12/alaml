import ProductsList from "@/components/Home/productsList";
import Hero from "../../components/Home/Hero";

import Categories from "@/components/Home/Categories";

export default function Home() {
  return (
    <>
      <main>
        <Hero />

        <Categories />

        <ProductsList />

        <section>
          <div className="mb-8">
            <h2 className="text-base  font-bold mb-4">المنتجات المقترحة</h2>
          </div>
        </section>
      </main>
    </>
  );
}
