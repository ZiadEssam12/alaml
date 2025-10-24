import { auth } from "@/auth/auth";
import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get all orders for a user with pagination
export async function GET(request) {
  try {
    const session = await getUserTokenSSR(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);

    // Combine count and findMany queries into a transaction
    const [totalOrders, orders] = await prisma.$transaction([
      prisma.order.count({ where: { userId } }),
      prisma.order.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
    ]);

    const maxPage = Math.ceil(totalOrders / limit);

    return NextResponse.json(
      {
        data: orders,
        pagination: {
          page,
          maxPage,
          totalOrders,
        },
        message: "Orders fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST: Create a new order
export async function POST(request) {
  try {
    const session = await getUserTokenSSR(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingStreet,
      shippingCity,
      shippingZipCode,
      paymentMethod,
      notes,
      couponCode,
    } = body;

    // Combine cart and cart items queries into a transaction
    const [cart, cartItems] = await prisma.$transaction([
      prisma.cart.findUnique({
        where: { userId },
        select: { id: true },
      }),
      prisma.cartItem.findMany({
        where: { cart: { userId } },
        include: {
          product: true,
          variant: true,
        },
      }),
    ]);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "السلة فارغة لا يمكن إنشاء طلب جديد" },
        { status: 400 }
      );
    }

    // Validate that all cart items respect maxQuantityPerUser and stock availability
    for (const item of cartItems) {
      if (item.quantity > item.product.maxQuantityPerUser) {
        return NextResponse.json(
          {
            error: `كمية المنتج "${item.product.name}" (${item.quantity}) تتجاوز الحد الأقصى المسموح به: ${item.product.maxQuantityPerUser}`,
          },
          { status: 409 }
        );
      }

      // If variant is selected, validate variant stock
      if (item.variantId && item.variant) {
        if (item.quantity > item.variant.stockQuantity) {
          return NextResponse.json(
            {
              error: `كمية الخيار المختار من "${item.product.name}" (${item.quantity}) غير متوفرة. المتاح: ${item.variant.stockQuantity}`,
            },
            { status: 409 }
          );
        }
      } else {
        // Validate base product stock
        if (item.quantity > item.product.stockQuantity) {
          return NextResponse.json(
            {
              error: `كمية المنتج "${item.product.name}" (${item.quantity}) غير متوفرة. المتاح: ${item.product.stockQuantity}`,
            },
            { status: 409 }
          );
        }
      }
    }

    let subtotal = 0;
    const itemsWithTotal = cartItems.map((item) => {
      const price = item.product.price;
      const total = price * item.quantity;
      subtotal += total;
      return {
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price,
        total,
      };
    });

    let coupon = null;
    let discount = 0;
    let shippingCost = subtotal >= 200 ? 0 : 30;

    if (couponCode) {
      try {
        const couponResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/coupons/apply`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              userid: userId,
            },
            body: JSON.stringify({ couponCode }),
          }
        );
        const couponResult = await couponResponse.json();
        if (!couponResponse.ok) {
          return NextResponse.json(
            { error: couponResult.message || "Invalid coupon" },
            { status: 400 }
          );
        }
        coupon = couponResult.coupon;
        discount = couponResult.discount;

        if (coupon.type === "free_shipping") {
          shippingCost = 0;
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to apply coupon" },
          { status: 500 }
        );
      }
    }

    const finalAmount = subtotal + shippingCost - discount;

    // Build transaction operations for updating stock
    const stockUpdateOps = [];

    for (const item of cartItems) {
      if (item.variantId) {
        // Update variant stock
        stockUpdateOps.push(
          prisma.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })
        );
      } else {
        // Update product stock
        stockUpdateOps.push(
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          })
        );
      }
    }

    // Create order and update stock in a transaction
    const [order] = await prisma.$transaction([
      prisma.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          shippingStreet,
          shippingCity,
          shippingZipCode,
          subtotal,
          shippingCost,
          discount,
          finalAmount,
          paymentMethod,
          notes,
          userId,
          couponId: coupon?.id,
          couponCode: coupon?.code,
          items: {
            create: itemsWithTotal,
          },
        },
        include: { items: true },
      }),
      ...stockUpdateOps,
      prisma.cartItem.deleteMany({ where: { cartId: cart.id } }),
    ]);

    // Create CouponUsage if coupon is applied
    if (coupon) {
      await prisma.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId,
          orderId: order.id,
        },
      });
    }

    return NextResponse.json(
      {
        orderId: order.id,
        success: true,
        message: "Order created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
