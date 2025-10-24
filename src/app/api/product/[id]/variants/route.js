import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET: Batch fetch multiple variants by IDs
 * Query: ?ids=variantId1,variantId2,...
 * Returns: VariantFull[]
 */
export async function GET(request, { params }) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");

    if (!idsParam) {
      return NextResponse.json(
        { error: "Variant IDs are required via ?ids=id1,id2,..." },
        { status: 400 }
      );
    }

    const variantIds = idsParam.split(",").filter((id) => id.trim());

    if (variantIds.length === 0) {
      return NextResponse.json(
        { error: "At least one variant ID is required" },
        { status: 400 }
      );
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        productId, // Ensure variants belong to the correct product
      },
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

    // Format response as VariantFull[]
    const response = variants.map((variant) => ({
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
    }));

    return NextResponse.json(
      { data: response, message: "Variants fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}
