import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * GET: List all variants for a product
 * POST: Create a new variant for a product
 */

export async function GET(request, { params }) {
  try {
    const { productId } = await params;
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

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        options: {
          include: {
            option: { select: { name: true } },
            value: { select: { value: true, hex: true, imageUrl: true } },
          },
        },
      },
    });

    return NextResponse.json(
      { data: variants, message: "Variants fetched successfully" },
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

export async function POST(request, { params }) {
  try {
    const { productId } = await params;
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
    const { sku, price, stockQuantity, imageUrls, options, isActive } = body;

    // Validate required fields
    if (!price || typeof price !== "number") {
      return NextResponse.json(
        { error: "Price is required and must be a number" },
        { status: 400 }
      );
    }

    if (typeof stockQuantity !== "number") {
      return NextResponse.json(
        { error: "Stock quantity must be a number" },
        { status: 400 }
      );
    }

    if (!options || !Array.isArray(options) || options.length === 0) {
      return NextResponse.json(
        { error: "At least one option value must be selected" },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create combination hash from sorted option IDs and value IDs
    const sortedOptions = options
      .sort((a, b) => a.optionId.localeCompare(b.optionId))
      .map((o) => `${o.optionId}:${o.valueId}`)
      .join("|");

    const combinationHash = crypto
      .createHash("sha256")
      .update(sortedOptions)
      .digest("hex");

    // Check if variant with same combination already exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { combinationHash },
    });

    if (existingVariant) {
      return NextResponse.json(
        { error: "This variant combination already exists" },
        { status: 409 }
      );
    }

    // Create variant with options in transaction
    const variant = await prisma.$transaction(async (tx) => {
      const newVariant = await tx.productVariant.create({
        data: {
          productId,
          sku: sku || null,
          price: parseFloat(price),
          stockQuantity: parseInt(stockQuantity),
          imageUrls: imageUrls || [],
          isActive: isActive !== false,
          combinationHash,
        },
      });

      // Create variant options
      for (const opt of options) {
        await tx.productVariantOption.create({
          data: {
            variantId: newVariant.id,
            optionId: opt.optionId,
            valueId: opt.valueId,
          },
        });
      }

      return tx.productVariant.findUnique({
        where: { id: newVariant.id },
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
      { data: variant, message: "Variant created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating variant:", error);
    return NextResponse.json(
      { error: "Failed to create variant" },
      { status: 500 }
    );
  }
}
