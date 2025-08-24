import ProductsList from "@/components/Home/productsList";
import Hero from "../../components/Home/Hero";
import Categories from "@/components/Home/Categories";

export default async function Home() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/home`, {
    cache: "no-store",
  });
  const { categories, products } = await res.json();

  return (
    <>
      <main>
        <Hero />
        <Categories data={categories} />
        <ProductsList data={products} />

        <section>
          <div className="mb-8">
            <h2 className="text-base  font-bold mb-4">المنتجات المقترحة</h2>
          </div>
        </section>
      </main>
    </>
  );
}
