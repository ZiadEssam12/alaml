import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateOptionOrValueInput } from "@/schema/dashboard/productOptions";

// Endpoint : base/products/[productId]/options/[optionId]
// Method : PUT
// Updates option and/or a specific value (if valueId is provided)
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
    const { valueId, ...fields } = body; // Extract valueId from body

    let validated;
    // Validation Schema check
    try {
      validated = await UpdateOptionOrValueInput.validate(fields, {
        abortEarly: false,
      });
    } catch (error) {
      console.log("error:", error.message);
      return NextResponse.json(
        { error: "فشل في التحقق من صحة البيانات", details: error.errors },
        { status: 400 }
      );
    }

    // Separate option fields from value fields
    const optionFields = {};
    if (validated.name !== undefined) optionFields.name = validated.name;
    if (validated.presentation !== undefined)
      optionFields.presentation = validated.presentation;

    const valueFields = {};
    if (validated.value !== undefined) valueFields.value = validated.value;
    if (validated.hex !== undefined) valueFields.hex = validated.hex;
    if (validated.imageUrl !== undefined)
      valueFields.imageUrl = validated.imageUrl;

    // Handle position: if updating a value, use it for the value; otherwise for the option
    const hasValueFields = Object.keys(valueFields).length > 0;
    if (validated.position !== undefined) {
      if (hasValueFields && valueId) {
        valueFields.position = validated.position;
      } else {
        optionFields.position = validated.position;
      }
    }

    // Check if value fields are provided but valueId is missing
    if (hasValueFields && !valueId) {
      return NextResponse.json(
        { error: "معرف القيمة مطلوب عند تعديل قيمة الخيار" },
        { status: 400 }
      );
    }

    // Verify valueId belongs to this option if provided
    if (valueId) {
      const value = await prisma.productOptionValue.findFirst({
        where: { id: valueId, optionId },
      });
      if (!value) {
        return NextResponse.json(
          { error: "القيمة غير موجودة أو لا تنتمي لهذا الخيار" },
          { status: 404 }
        );
      }
    }

    // Perform updates in a transaction
    await prisma.$transaction(async (tx) => {
      // Update option if there are option fields
      if (Object.keys(optionFields).length > 0) {
        await tx.productOption.update({
          where: { id: optionId },
          data: optionFields,
        });
      }

      // Update value if valueId is provided and there are value fields
      if (valueId && Object.keys(valueFields).length > 0) {
        await tx.productOptionValue.update({
          where: { id: valueId },
          data: valueFields,
        });
      }
    });

    // Fetch and return the updated option with all values
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
    console.error("error:", error.message);
    return NextResponse.json(
      { error: "حدث خطأ اثناء تعديل الاختيار" },
      { status: 500 }
    );
  }
}

// Endpoint : base/products/[productId]/options/[optionId]
// Method : Delete
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
