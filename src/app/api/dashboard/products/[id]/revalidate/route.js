import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request, { params }) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    revalidatePath(`/products/${productId}`);
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
