import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const { id: productId, optionId, valueId } = await params;

    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    if (!optionId) {
      return NextResponse.json({ error: "معرف الخيار مطلوب" }, { status: 400 });
    }

    if (!valueId) {
      return NextResponse.json({ error: "معرف القيمة مطلوب" }, { status: 400 });
    }

    // Check if value exists and belongs to the option
    const value = await prisma.productOptionValue.findFirst({
      where: {
        id: valueId,
        optionId,
        option: { productId },
      },
      select: { id: true, value: true },
    });

    if (!value) {
      return NextResponse.json({ error: "القيمة غير موجودة" }, { status: 404 });
    }

    // Delete the value (cascade will handle ProductVariantOption)
    // This also affects variants that reference this value
    await prisma.$transaction(async (tx) => {
      // Find all variants that have variant-options for this value
      const affectedVariants = await tx.productVariantOption.findMany({
        where: { valueId },
        select: { variantId: true },
        distinct: ["variantId"],
      });

      const variantIds = affectedVariants.map((v) => v.variantId);

      // Delete the value (cascade will handle ProductVariantOption)
      await tx.productOptionValue.delete({
        where: { id: valueId },
      });

      // Deactivate affected variants since they no longer have complete combinations
      if (variantIds.length > 0) {
        await tx.productVariant.updateMany({
          where: { id: { in: variantIds } },
          data: { isActive: false },
        });
      }
    });

    return NextResponse.json(
      { message: "تم حذف القيمة بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting option value:", error);
    return NextResponse.json({ error: "فشل في حذف القيمة" }, { status: 500 });
  }
}
