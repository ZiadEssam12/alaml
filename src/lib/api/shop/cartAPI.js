import prisma from "@/lib/prisma";

export async function getCartDetails(userId, couponCode) {
  let cartItems = [];
  let coupon = null;

  try {
    if (userId) {
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      cartItems = cart?.items || [];

      // Apply coupon if provided
      if (couponCode) {
        try {
          const couponData = await prisma.coupon.findFirst({
            where: {
              code: couponCode,
              isActive: true,
              startDate: { lte: new Date() },
              expirationDate: { gte: new Date() },
            },
          });

          if (couponData) {
            const cartTotal = cartItems.reduce(
              (acc, item) => acc + item.price * item.quantity,
              0
            );

            let discount = 0;
            if (couponData.type === "percentage") {
              const percentageDiscount =
                (cartTotal * Number(couponData.value)) / 100;
              discount = Math.min(
                percentageDiscount,
                Number(couponData.maxDiscountAmount) || percentageDiscount
              );
            } else if (couponData.type === "fixed") {
              discount = Math.min(
                Number(couponData.value),
                Number(couponData.maxDiscountAmount) || Number(couponData.value)
              );
            }

            coupon = {
              coupon: couponData,
              discount,
              message: "تم تطبيق الكوبون بنجاح",
            };
          }
        } catch (error) {
          console.error("💥 Failed to apply coupon:", error);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching cart details:", error);
  }

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  return { cartItems, coupon, total };
}
