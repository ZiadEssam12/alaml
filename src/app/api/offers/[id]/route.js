import { prisma } from "@/lib/prisma";
import { validateOfferForm } from "@/schema/dashboard/managingOffers";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Full offer update with validation
    const validatedData = validateOfferForm(body);

    if (!validatedData.isValid) {
      return NextResponse.json(
        {
          error: "بيانات غير صالحة لتحديث العرض",
          fieldsWithErrors: validatedData.errors || {},
        },
        { status: 400 }
      );
    }

    // Existence checks
    if (validatedData.data.scope === "category") {
      const existsCategory = await prisma.category.findUnique({
        where: { id: validatedData.data.categoryId },
      });
      if (!existsCategory) {
        return NextResponse.json(
          { error: "الفئة المحددة غير موجودة" },
          { status: 400 }
        );
      }
    }

    if (validatedData.data.scope === "product") {
      const existsProduct = await prisma.product.findUnique({
        where: { id: validatedData.data.productId },
      });
      if (!existsProduct) {
        return NextResponse.json(
          { error: "المنتج المحدد غير موجود" },
          { status: 400 }
        );
      }
    }

    if (validatedData.data.scope === "variant") {
      const existsVariant = await prisma.productVariant.findUnique({
        where: { id: validatedData.data.variantId },
      });
      if (!existsVariant) {
        return NextResponse.json(
          { error: "المتغير المحدد غير موجود" },
          { status: 400 }
        );
      }
    }

    // Check for overlapping offers (excluding current offer)
    const entityFilter = {
      ...(validatedData.data.scope === "category" && {
        categoryId: validatedData.data.categoryId,
      }),
      ...(validatedData.data.scope === "product" && {
        productId: validatedData.data.productId,
      }),
      ...(validatedData.data.scope === "variant" && {
        variantId: validatedData.data.variantId,
      }),
    };

    const overlapOffer = await prisma.offer.findFirst({
      where: {
        scope: validatedData.data.scope,
        isActive: true,
        ...entityFilter,
        NOT: [
          { expirationDate: { lt: validatedData.data.startDate } },
          { startDate: { gt: validatedData.data.expirationDate } },
          { id: id }, // Exclude current offer
        ],
      },
    });

    if (overlapOffer) {
      return NextResponse.json(
        {
          error: "يوجد عرض آخر لنفس الكيان في نفس الفترة الزمنية.",
          existingOfferId: overlapOffer.id,
        },
        { status: 409 }
      );
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        title: validatedData.data.title,
        description: validatedData.data.description,
        scope: validatedData.data.scope,
        productId: validatedData.data.productId || null,
        categoryId: validatedData.data.categoryId || null,
        variantId: validatedData.data.variantId || null,
        type: validatedData.data.type,
        value: validatedData.data.value,
        isActive: validatedData.data.isActive,
        isAutoApply: validatedData.data.isAutoApply,
        maxUsageCount: validatedData.data.maxUsageCount || null,
        perUserUsageCount: validatedData.data.perUserUsageCount || null,
        maxDiscountAmount: validatedData.data.maxDiscountAmount || null,
        minCartAmount: validatedData.data.minCartAmount || null,
        startDate: validatedData.data.startDate,
        expirationDate: validatedData.data.expirationDate,
      },
    });

    return NextResponse.json(updatedOffer, { status: 200 });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json({ error: "فشل في تحديث العرض" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const deletedOffer = await prisma.offer.delete({
      where: { id },
    });

    return NextResponse.json(deletedOffer);
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json({ error: "فشل في حذف العرض" }, { status: 500 });
  }
}
