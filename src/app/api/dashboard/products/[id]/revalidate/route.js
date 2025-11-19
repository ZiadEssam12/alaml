import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request, { params }) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    // Revalidate the product page
    const productSlug = await prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    });

    // Revalidate only if product slug exists
    // The revalidated path should match the actual product page path
    if (!productSlug?.slug) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }
    revalidatePath(`/products/${productSlug.slug}`);
    return NextResponse.json(
      { message: `المنتج ${productId} تم تحديثه بنجاح` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error revalidating product:", error);
    return NextResponse.json(
      { error: "Failed to revalidate product" },
      { status: 500 }
    );
  }
}
