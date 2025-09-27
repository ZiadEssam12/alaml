import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await getUserTokenSSR(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const { couponCode } = await req.json();

    if (!couponCode) {
      return NextResponse.json(
        { message: "رمز الكوبون مطلوب" },
        { status: 400 }
      );
    }

    // Combine cart items and coupon queries into a single transaction
    const [cartItems, coupon] = await prisma.$transaction([
      prisma.cartItem.findMany({
        where: {
          cart: {
            userId: userId,
          },
        },
        include: { product: true },
      }),
      prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          startDate: { lte: new Date() },
          expirationDate: { gte: new Date() },
        },
      }),
    ]);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: "السلة فارغة لا يمكن إنشاء طلب جديد" },
        { status: 400 }
      );
    }

    if (!coupon) {
      return NextResponse.json(
        { message: "الكوبون غير صالح" },
        { status: 400 }
      );
    }

    // Parallelize usage count queries
    const [totalUsageCount, userUsageCount] = await Promise.all([
      coupon.maxUsageCount
        ? prisma.couponUsage.count({ where: { couponId: coupon.id } })
        : Promise.resolve(0),
      coupon.perUserUsageCount
        ? prisma.couponUsage.count({
            where: { couponId: coupon.id, userId: userId },
          })
        : Promise.resolve(0),
    ]);

    // Check total coupon usage
    if (coupon.maxUsageCount && totalUsageCount >= coupon.maxUsageCount) {
      return NextResponse.json(
        { message: "تم استخدام هذا الكوبون بالكامل" },
        { status: 400 }
      );
    }

    // Check user-specific coupon usage
    if (
      coupon.perUserUsageCount &&
      userUsageCount >= coupon.perUserUsageCount
    ) {
      return NextResponse.json(
        { message: "تم استخدام هذا الكوبون من قبلك بالكامل" },
        { status: 400 }
      );
    }

    if (coupon.type === "free_shipping") {
      return NextResponse.json(
        {
          coupon,
          discount: 0,
          message: "كوبون شحن مجاني صالح",
        },
        { status: 200 }
      );
    }

    const cartTotalAmount = cartItems.reduce((acc, item) => {
      const price = item.product.price || 0;
      return acc + price * item.quantity;
    }, 0);

    // Check minimum cart amount requirement
    if (coupon.minCartAmount && cartTotalAmount < coupon.minCartAmount) {
      return NextResponse.json(
        {
          message: `الحد الأدنى للسلة هو ${
            coupon.minCartAmount
          } جنيه. إجمالي سلتك الحالي: ${cartTotalAmount.toFixed(2)} جنيه`,
        },
        { status: 400 }
      );
    }

    let discount = 0;

    if (coupon.type === "percentage") {
      const percentageDiscount = (cartTotalAmount * coupon.value) / 100;
      discount = Math.min(
        percentageDiscount,
        coupon.maxDiscountAmount || percentageDiscount
      );
    } else if (coupon.type === "fixed") {
      discount = Math.min(
        coupon.value,
        coupon.maxDiscountAmount || coupon.value
      );
    }

    return NextResponse.json(
      {
        coupon,
        discount,
        message: "تم تطبيق الكوبون بنجاح",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error applying coupon:", error);
    return NextResponse.json(
      { error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}
