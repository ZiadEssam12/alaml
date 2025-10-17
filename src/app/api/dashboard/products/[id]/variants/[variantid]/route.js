import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// Update endpoint for product variants
// endpoint : base/products/[id]/variants/[id]
// Method : PUT
export async function PUT(request, { params }) {
  try {
    // 1- getting product and variant IDs from params
    const { id: productId, variantId } = await params;

    // 2- checking for required params
    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }
    if (!variantId) {
      return NextResponse.json(
        { error: "معرف المتغير مطلوب" },
        { status: 400 }
      );
    }

    // 3- checking for product existence

    const variant = await prisma.variant.findFirst({
      where: {
        id: variantId,
        productID: productId,
      },
      select: { id: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "المتغير غير موجود" }, { status: 404 });
    }

    // 4- getting update data from request body
    const data = await request.json();

    // 5- updating the variant
    const updatedVariant = await prisma.variant.update({
      where: { id: variantId },
      data: {
        ...data,
      },
    });

    return NextResponse.json({ variant: updatedVariant }, { status: 200 });
  } catch (error) {
    console.error("error:", error.message);
    return NextResponse.json(
      { error: "حدث خطأ اثناء تعديل المتغير" },
      { status: 500 }
    );
  }
}

// Delete endpoint for variant options
// endpoint : base/products/[id]/variants/[id]
// Method : Delete
export async function DELETE(request, { params }) {
  try {
    const { id: productId, variantId } = await params;
    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }
    if (!variantId) {
      return NextResponse.json(
        { error: "معرف المتغير مطلوب" },
        { status: 400 }
      );
    }

    // Check if variant exists and belongs to this product
    const variant = await prisma.variant.findFirst({
      where: {
        id: variantId,
        productID: productId,
      },
      select: { id: true },
    });

    if (!variant) {
      return NextResponse.json({ error: "المتغير غير موجود" }, { status: 404 });
    }

    // if it exists, set isActive= falase the variant
    await prisma.variant.update({
      where: { id: variantId },
      data: { isActive: false },
    });

    return NextResponse.json(
      { message: "تم تعطيل المتغير بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.error("error:", error.message);
    return NextResponse.json(
      { error: "حدث خطأ اثناء حذف المتغير" },
      { status: 500 }
    );
  }
}
