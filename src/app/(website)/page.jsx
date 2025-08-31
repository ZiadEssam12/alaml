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
          <ProductsList data={products} title="المنتجات المقترحة" />
        </section>
      </main>
    </>
  );
}
