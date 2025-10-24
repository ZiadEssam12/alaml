import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET: Get a single variant by ID
 * Returns: VariantFull with all details
 */
export async function GET(request, { params }) {
  try {
    const { id: productId, variantId } = await params;

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        options: {
          select: {
            optionId: true,
            valueId: true,
            option: { select: { name: true, position: true } },
            value: {
              select: {
                value: true,
                hex: true,
                imageUrl: true,
                position: true,
              },
            },
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Format response as VariantFull
    const response = {
      id: variant.id,
      sku: variant.sku,
      price: variant.price,
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive,
      imageUrls: variant.imageUrls,
      options: variant.options.map((opt) => ({
        optionId: opt.optionId,
        optionName: opt.option.name,
        valueId: opt.valueId,
        value: opt.value.value,
        hex: opt.value.hex,
        imageUrl: opt.value.imageUrl,
      })),
    };

    return NextResponse.json(
      { data: response, message: "Variant fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching variant:", error);
    return NextResponse.json(
      { error: "Failed to fetch variant" },
      { status: 500 }
    );
  }
}
