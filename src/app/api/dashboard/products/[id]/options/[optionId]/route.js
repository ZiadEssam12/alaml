import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateOptionOrValueInput } from "@/schema/dashboard/productOptions";

export async function PUT(request, { params }) {
  try {
    const { id: productId, optionId } = await params;
    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }
    if (!optionId) {
      return NextResponse.json({ error: "معرف الخيار مطلوب" }, { status: 400 });
    }

    const productOption = await prisma.productOption.findFirst({
      where: {
        id: optionId,
        productId,
      },
    });
    if (!productOption) {
      return NextResponse.json({ error: "الخيار غير موجود" }, { status: 404 });
    }

    const body = await request.json();
    let validated;
    // Validation Schema check
    try {
      validated = await UpdateOptionOrValueInput.validate(body, {
        abortEarly: false,
      });
    } catch (error) {
      console.log("error:", error.message);
      return NextResponse.json(
        { error: "فشل في التحقق من صحة البيانات" },
        { status: 400 }
      );
    }

    const optionFields = {
      name: validated.name,
      position: validated.position,
    };

    const valueFields = {
      value: validated.value,
      hex: validated.hex,
      imageUrl: validated.imageUrl,
      position: validated.valuePosition,
    };

    await prisma.$transaction([
      prisma.productOption.update({
        where: { id: optionId },
        data: optionFields,
      }),
      prisma.productOptionValue.update({
        where: { id: valueId },
        data: valueFields,
      }),
    ]);

    const updatedOption = await prisma.productOption.findUnique({
      where: { id: optionId },
      include: {
        values: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            value: true,
            hex: true,
            imageUrl: true,
            position: true,
          },
        },
      },
    });

    return NextResponse.json({ option: updatedOption }, { status: 200 });
  } catch (error) {
    console.log("error:", error.message);
    return NextResponse.json(
      { error: "حدث خطأ اثناء تعديل الاختيار" },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id: productId, optionId } = await params;

    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    if (!optionId) {
      return NextResponse.json({ error: "معرف الخيار مطلوب" }, { status: 400 });
    }

    // Check if option exists and belongs to this product
    const option = await prisma.productOption.findFirst({
      where: {
        id: optionId,
        productId,
      },
      select: { id: true },
    });

    if (!option) {
      return NextResponse.json({ error: "الخيار غير موجود" }, { status: 404 });
    }

    // Delete option (cascades to ProductOptionValue and ProductVariantOption)
    // This also affects variants that reference this option's values
    await prisma.$transaction(async (tx) => {
      // Find all variants that have variant-options for this option
      const affectedVariants = await tx.productVariantOption.findMany({
        where: { optionId },
        select: { variantId: true },
        distinct: ["variantId"],
      });

      const variantIds = affectedVariants.map((v) => v.variantId);

      // Delete the option (cascade will handle ProductOptionValue and ProductVariantOption)
      await tx.productOption.delete({
        where: { id: optionId },
      });

      // Delete or deactivate affected variants since they no longer have complete combinations
      if (variantIds.length > 0) {
        // Option 1: Delete variants entirely
        await tx.productVariant.deleteMany({
          where: { id: { in: variantIds } },
        });
      }
    });

    return NextResponse.json(
      { message: "تم حذف الخيار بنجاح" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Error deleting option:", error);
    return NextResponse.json({ error: "فشل في حذف الخيار" }, { status: 500 });
  }
}
