import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * PUT: Update a variant
 * DELETE: Delete a variant
 */

export async function PUT(request, { params }) {
  try {
    const { variantId } = await params;
    const session = await getUserTokenSSR(request);

    if (session?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { sku, price, stockQuantity, imageUrls, options, isActive } = body;

    // Fetch existing variant
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { options: true },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // If options changed, regenerate hash and check for duplicates
    let newCombinationHash = existingVariant.combinationHash;
    if (options && Array.isArray(options) && options.length > 0) {
      const sortedOptions = options
        .sort((a, b) => a.optionId.localeCompare(b.optionId))
        .map((o) => `${o.optionId}:${o.valueId}`)
        .join("|");

      newCombinationHash = crypto
        .createHash("sha256")
        .update(sortedOptions)
        .digest("hex");

      // Check if another variant has this combination
      if (newCombinationHash !== existingVariant.combinationHash) {
        const duplicate = await prisma.productVariant.findUnique({
          where: { combinationHash: newCombinationHash },
        });

        if (duplicate) {
          return NextResponse.json(
            { error: "This variant combination already exists" },
            { status: 409 }
          );
        }
      }
    }

    // Update variant with options in transaction
    const updatedVariant = await prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.update({
        where: { id: variantId },
        data: {
          ...(sku !== undefined && { sku: sku || null }),
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(stockQuantity !== undefined && {
            stockQuantity: parseInt(stockQuantity),
          }),
          ...(imageUrls && { imageUrls }),
          ...(isActive !== undefined && { isActive }),
          combinationHash: newCombinationHash,
        },
      });

      // Update options if provided
      if (options && Array.isArray(options) && options.length > 0) {
        // Delete existing options
        await tx.productVariantOption.deleteMany({
          where: { variantId },
        });

        // Create new options
        for (const opt of options) {
          await tx.productVariantOption.create({
            data: {
              variantId,
              optionId: opt.optionId,
              valueId: opt.valueId,
            },
          });
        }
      }

      return tx.productVariant.findUnique({
        where: { id: variantId },
        include: {
          options: {
            include: {
              option: { select: { name: true } },
              value: { select: { value: true, hex: true, imageUrl: true } },
            },
          },
        },
      });
    });

    return NextResponse.json(
      { data: updatedVariant, message: "Variant updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating variant:", error);
    return NextResponse.json(
      { error: "Failed to update variant" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { variantId } = await params;
    const session = await getUserTokenSSR(request);

    if (session?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!variantId) {
      return NextResponse.json(
        { error: "Variant ID is required" },
        { status: 400 }
      );
    }

    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    // Delete variant (cascade will delete options and cart items)
    await prisma.productVariant.delete({
      where: { id: variantId },
    });

    return NextResponse.json(
      { message: "Variant deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting variant:", error);
    return NextResponse.json(
      { error: "Failed to delete variant" },
      { status: 500 }
    );
  }
}
