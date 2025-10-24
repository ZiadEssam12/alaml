import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * PUT: Bulk update variants
 * Body: {
 *   ids: string[],
 *   set: {
 *     price?: number,
 *     stockQuantity?: number,
 *     isActive?: boolean,
 *     sku?: string
 *   }
 * }
 */
export async function PUT(request, { params }) {
  try {
    const { id: productId } = await params;
    const session = await getUserTokenSSR(request);

    if (session?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { ids = [], set = {} } = body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "At least one variant ID is required" },
        { status: 400 }
      );
    }

    if (typeof set !== "object" || Object.keys(set).length === 0) {
      return NextResponse.json(
        { error: "At least one field to update is required" },
        { status: 400 }
      );
    }

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Validate all variant IDs belong to this product
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: ids }, productId },
      select: { id: true },
    });

    if (variants.length !== ids.length) {
      return NextResponse.json(
        { error: "Some variant IDs do not belong to this product" },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData = {};
    if (set.price !== undefined) updateData.price = parseFloat(set.price);
    if (set.stockQuantity !== undefined)
      updateData.stockQuantity = parseInt(set.stockQuantity);
    if (set.isActive !== undefined) updateData.isActive = set.isActive;
    if (set.sku !== undefined) updateData.sku = set.sku || null;

    // Perform bulk update
    const result = await prisma.productVariant.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    });

    // Fetch updated variants
    const updatedVariants = await prisma.productVariant.findMany({
      where: { id: { in: ids } },
      include: {
        productVariantOptions: {
          include: {
            option: { select: { name: true } },
            value: { select: { value: true, hex: true, imageUrl: true } },
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Variants updated successfully",
        updated: result.count,
        variants: updatedVariants,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error bulk updating variants:", error);
    return NextResponse.json(
      { error: "Failed to bulk update variants" },
      { status: 500 }
    );
  }
}
