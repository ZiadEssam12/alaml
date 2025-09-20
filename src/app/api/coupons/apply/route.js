import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { couponCode } = await req.json();
  const userId = req.headers.get("userid");

  if (!couponCode) {
    return NextResponse.json({ message: "رمز الكوبون مطلوب" }, { status: 400 });
  }
  if (!userId) {
    return NextResponse.json(
      { message: "معرف المستخدم مطلوب" },
      { status: 400 }
    );
  }

  // Get cart ID for user
  const cartId = await prisma.cart.findUnique({
    where: { userId: userId },
    select: { id: true },
  });

  if (!cartId) {
    return NextResponse.json(
      { error: "لم يتم العثور على سلة مرتبطة بهذا المستخدم" },
      { status: 400 }
    );
  }

  // Get cart items for user
  const cartItems = await prisma.cartItem.findMany({
    where: { cartId: cartId.id },
    include: { product: true },
  });

  if (!cartItems || cartItems.length === 0) {
    return NextResponse.json(
      { error: "السلة فارغة لا يمكن إنشاء طلب جديد" },
      { status: 400 }
    );
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode,
      isActive: true,
      startDate: { lte: new Date() },
      expirationDate: { gte: new Date() },
    },
  });

  if (!coupon) {
    return NextResponse.json({ message: "الكوبون غير صالح" }, { status: 400 });
  }

  // Check total coupon usage
  if (coupon.maxUsageCount) {
    const totalUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id },
    });
    if (totalUsageCount >= coupon.maxUsageCount) {
      return NextResponse.json(
        { message: "تم استخدام هذا الكوبون بالكامل" },
        { status: 400 }
      );
    }
  }

  // Check user-specific coupon usage
  if (coupon.perUserUsageCount) {
    const userUsageCount = await prisma.couponUsage.count({
      where: { couponId: coupon.id, userId: userId },
    });
    if (userUsageCount >= coupon.perUserUsageCount) {
      return NextResponse.json(
        { message: "تم استخدام هذا الكوبون من قبلك بالكامل" },
        { status: 400 }
      );
    }
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
    discount = Math.min(coupon.value, coupon.maxDiscountAmount || coupon.value);
  }

  return NextResponse.json(
    {
      coupon,
      discount,
      message: "تم تطبيق الكوبون بنجاح",
    },
    { status: 200 }
  );
}
