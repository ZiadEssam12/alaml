import prisma from "@/lib/prisma";

/**
 * Update denormalized review statistics for a product
 * Called after creating, updating, or deleting a review
 */
export async function updateProductReviewStats(productId) {
  try {
    // Calculate aggregated stats for approved reviews only
    const stats = await prisma.review.aggregate({
      where: {
        productId,
        status: "approved",
      },
      _avg: {
        rating: true,
      },
      _sum: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    // Update product with denormalized values
    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: stats._avg.rating || 0,
        ratingSum: stats._sum.rating || 0,
        ratingCount: stats._count.id || 0,
      },
    });
  } catch (error) {
    console.error(
      `Error updating review stats for product ${productId}:`,
      error
    );
    throw error;
  }
}
