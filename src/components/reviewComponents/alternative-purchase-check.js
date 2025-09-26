// Alternative approach - Direct join query
async function checkUserPurchaseAlternative(userId, productId) {
  try {
    // Direct SQL-like approach using Prisma
    const purchase = await prisma.orderItem.findFirst({
      where: {
        productId: productId,
        order: {
          userId: userId,
          status: { in: ["shipped", "delivered"] },
        },
      },
      select: {
        id: true,
        order: {
          select: {
            id: true,
            status: true,
            customerName: true,
          },
        },
      },
    });

    console.log("Alternative purchase check:", purchase);
    return !!purchase;
  } catch (error) {
    console.error("Error in alternative purchase check:", error);
    return false;
  }
}
