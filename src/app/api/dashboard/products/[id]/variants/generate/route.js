import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * POST: Generate variants from Cartesian product of option values
 * Body: {
 *   strategy: "cartesian",
 *   includeInactive?: boolean,
 *   basePrice?: number,
 *   baseStock?: number
 * }
 */
export async function POST(request, { params }) {
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
    const {
      strategy = "cartesian",
      includeInactive = false,
      basePrice,
      baseStock = 0,
    } = body;

    // Validate strategy
    if (strategy !== "cartesian") {
      return NextResponse.json(
        { error: "Only 'cartesian' strategy is supported" },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, price: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch all product options with their values
    const options = await prisma.productOption.findMany({
      where: { productId },
      include: {
        values: {
          orderBy: { position: "asc" },
        },
      },
      orderBy: { position: "asc" },
    });

    // Filter out empty options
    const activeOptions = options.filter((opt) => opt.values.length > 0);

    if (activeOptions.length === 0) {
      return NextResponse.json(
        { error: "No options with values found", generated: [] },
        { status: 200 }
      );
    }

    // Generate Cartesian product
    const cartesianProduct = (arrays) => {
      if (arrays.length === 0) return [[]];
      if (arrays.length === 1) return arrays[0].map((x) => [x]);

      const result = [];
      const restProduct = cartesianProduct(arrays.slice(1));

      for (const item of arrays[0]) {
        for (const rest of restProduct) {
          result.push([item, ...rest]);
        }
      }
      return result;
    };

    const valueArrays = activeOptions.map((opt) => opt.values);
    const combinations = cartesianProduct(valueArrays);

    // Use provided price or fallback to product price
    const variantPrice = basePrice ?? product.price;

    // Create variants atomically
    const createdVariants = await prisma.$transaction(
      async (tx) => {
        const created = [];

        for (const combination of combinations) {
          // Create combination hash
          const sortedOptions = activeOptions
            .map((opt, idx) => `${opt.id}:${combination[idx].id}`)
            .sort()
            .join("|");

          const combinationHash = crypto
            .createHash("sha256")
            .update(sortedOptions)
            .digest("hex");

          // Check if variant already exists
          const existing = await tx.productVariant.findUnique({
            where: { combinationHash },
          });

          if (existing) {
            created.push({ id: existing.id, isNew: false, ...existing });
            continue;
          }

          // Create new variant
          const variant = await tx.productVariant.create({
            data: {
              productId,
              price: variantPrice,
              stockQuantity: baseStock,
              combinationHash,
              isActive: true,
              imageUrls: [],
              sku: null,
              options: {
                create: activeOptions.map((opt, idx) => ({
                  optionId: opt.id,
                  valueId: combination[idx].id,
                })),
              },
            },
            include: {
              options: {
                include: {
                  option: { select: { name: true } },
                  value: { select: { value: true, hex: true, imageUrl: true } },
                },
              },
            },
          });

          created.push({ ...variant, isNew: true });
        }

        return created;
      },
      { timeout: 30000 } // 30 second timeout for large products
    );

    // Separate new from existing
    const newVariants = createdVariants.filter((v) => v.isNew);
    const existingVariants = createdVariants.filter((v) => !v.isNew);

    return NextResponse.json(
      {
        message: "Variants generated successfully",
        generated: {
          total: createdVariants.length,
          new: newVariants.length,
          existing: existingVariants.length,
          variants: createdVariants,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error generating variants:", error);
    return NextResponse.json(
      { error: "Failed to generate variants" },
      { status: 500 }
    );
  }
}
