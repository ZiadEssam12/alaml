import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// // GET: Get all carts with pagination
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const page = Number(searchParams.get("page") || 1);
//     const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);

//     const totalCarts = await prisma.cart.count();
//     const maxPage = Math.ceil(totalCarts / limit);

//     const carts = await prisma.cart.findMany({
//       skip: (page - 1) * limit,
//       take: limit,
//       orderBy: { createdAt: "desc" },
//       include: { items: true },
//     });

//     return NextResponse.json(
//       {
//         data: carts,
//         page,
//         maxPage,
//         message: "Carts fetched successfully",
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Failed to fetch carts" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request) {
  try {
    const session = await getUserTokenSSR(request);

    const body = await request.json();
    const { item } = body;
    if (!session) {
      return NextResponse.json(
        { error: "المستخدم غير مصرح له" },
        { status: 401 }
      );
    }

    if (!item || !item.productId) {
      return NextResponse.json(
        { error: "بيانات العنصر غير صحيحة" },
        { status: 400 }
      );
    }

    // If variant is specified, validate variant instead of product
    if (item.variantId) {
      const [product, variant, existingItem] = await Promise.all([
        prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            name: true,
            maxQuantityPerUser: true,
            imageUrls: true,
          },
        }),
        prisma.productVariant.findUnique({
          where: { id: item.variantId },
          select: {
            id: true,
            sku: true,
            price: true,
            stockQuantity: true,
            isActive: true,
            imageUrls: true,
            options: {
              select: {
                optionId: true,
                valueId: true,
                option: { select: { name: true } },
                value: { select: { value: true } },
              },
            },
          },
        }),
        prisma.cartItem.findFirst({
          where: {
            cart: { userId: session.id },
            productId: String(item.productId),
            variantId: String(item.variantId),
          },
        }),
      ]);

      if (!product) {
        return NextResponse.json(
          { error: "المنتج غير موجود في قاعدة البيانات" },
          { status: 404 }
        );
      }

      if (!variant) {
        return NextResponse.json(
          { error: "هذا الخيار غير موجود" },
          { status: 404 }
        );
      }

      if (!variant.isActive) {
        return NextResponse.json(
          { error: "هذا الخيار غير متاح للشراء" },
          { status: 409 }
        );
      }

      if (existingItem) {
        return NextResponse.json(
          { error: "هذا الخيار موجود بالفعل في السلة" },
          { status: 409 }
        );
      }

      if (variant.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: "الكمية المطلوبة من هذا الخيار غير متوفرة" },
          { status: 409 }
        );
      }

      // Check maxQuantityPerUser
      const totalQuantity = (existingItem?.quantity || 0) + item.quantity;
      if (totalQuantity > product.maxQuantityPerUser) {
        return NextResponse.json(
          {
            error: `الكمية الإجمالية (${totalQuantity}) تتجاوز الحد الأقصى المسموح به: ${product.maxQuantityPerUser}.`,
          },
          { status: 409 }
        );
      }

      // Use transaction to upsert cart and create item with variant
      const updatedCart = await prisma.$transaction(async (tx) => {
        const cart = await tx.cart.upsert({
          where: { userId: session.id },
          update: {},
          create: { userId: session.id },
        });

        // Build variant option display string
        const optionDisplay = variant.options
          .map((opt) => `${opt.option.name}: ${opt.value.value}`)
          .join(", ");

        // Use variant images if available, otherwise use product images
        const imageUrl =
          variant.imageUrls && variant.imageUrls.length > 0
            ? variant.imageUrls[0]
            : product.imageUrls && product.imageUrls.length > 0
            ? product.imageUrls[0]
            : "";

        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId,
            name: product.name,
            price: parseFloat(variant.price),
            quantity: item.quantity,
            imageUrl: imageUrl,
            variantOptions: optionDisplay,
          },
        });

        return tx.cart.findUnique({
          where: { id: cart.id },
          include: { items: true },
        });
      });

      return NextResponse.json(
        { data: updatedCart, message: "تمت إضافة العنصر إلى السلة" },
        { status: 201 }
      );
    }

    // Original product-only flow
    const [product, existingItem] = await Promise.all([
      prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          name: true,
          price: true,
          imageUrls: true,
          stockQuantity: true,
          maxQuantityPerUser: true,
        },
      }),
      prisma.cartItem.findFirst({
        where: {
          cart: { userId: session.id },
          productId: String(item.productId),
          variantId: null,
        },
      }),
    ]);

    if (!product) {
      return NextResponse.json(
        { error: "المنتج غير موجود في قاعدة البيانات" },
        { status: 404 }
      );
    }

    if (existingItem) {
      return NextResponse.json(
        { error: "العنصر موجود بالفعل في السلة" },
        { status: 409 }
      );
    }

    if (product.stockQuantity < item.quantity) {
      return NextResponse.json(
        { error: "الكمية المطلوبة غير متوفرة في المخزون" },
        { status: 409 }
      );
    }

    // Check if total quantity (existing + new) exceeds maxQuantityPerUser
    const totalQuantity = (existingItem?.quantity || 0) + item.quantity;
    if (totalQuantity > product.maxQuantityPerUser) {
      return NextResponse.json(
        {
          error: `الكمية الإجمالية (${totalQuantity}) تتجاوز الحد الأقصى المسموح به: ${
            product.maxQuantityPerUser
          }. لديك بالفعل ${
            existingItem?.quantity || 0
          } من هذا المنتج في السلة.`,
        },
        { status: 409 }
      );
    }

    // Use transaction to upsert cart and create item atomically
    const updatedCart = await prisma.$transaction(async (tx) => {
      // Upsert cart
      const cart = await tx.cart.upsert({
        where: { userId: session.id },
        update: {},
        create: { userId: session.id },
      });

      // Create cart item
      await tx.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          imageUrl: product.imageUrls?.[0] || null,
        },
      });

      // Return updated cart with items
      return tx.cart.findUnique({
        where: { id: cart.id },
        include: { items: true },
      });
    });

    return NextResponse.json(
      { data: updatedCart, message: "تمت إضافة العنصر إلى السلة" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "فشل في إضافة العنصر إلى السلة" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    // Getting user id from headers
    const session = await getUserTokenSSR(request);

    // Use transaction to delete items and fetch updated cart atomically
    const updatedCart = await prisma.$transaction(async (tx) => {
      // Find cart by unique userId
      const cart = await tx.cart.findUnique({
        where: { userId: session.id },
      });

      if (!cart) {
        throw new Error("السلة غير موجودة");
      }

      // Remove all items from the cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Return updated cart with items (should be empty)
      return tx.cart.findUnique({
        where: { id: cart.id },
        include: { items: true },
      });
    });

    return NextResponse.json(
      { data: updatedCart, message: "تمت إزالة جميع العناصر من السلة" },
      { status: 200 }
    );
  } catch (error) {
    if (error.message === "السلة غير موجودة") {
      return NextResponse.json({ error: "السلة غير موجودة" }, { status: 404 });
    }
    return NextResponse.json(
      { error: "فشل في حذف العنصر من السلة" },
      { status: 500 }
    );
  }
}
