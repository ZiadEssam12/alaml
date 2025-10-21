import prisma from "../src/lib/prisma.js";

async function recalculateReviewStats() {
  try {
    console.log("Starting review stats recalculation...\n");

    // Get all products
    const products = await prisma.product.findMany({
      select: { id: true, name: true },
    });

    console.log(`Found ${products.length} products to process\n`);

    let updated = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Get all approved reviews for the product
        const reviewStats = await prisma.review.aggregate({
          where: {
            productId: product.id,
            status: "approved",
          },
          _count: {
            id: true,
          },
          _sum: {
            rating: true,
          },
        });

        const ratingCount = reviewStats._count.id || 0;
        const ratingSum = reviewStats._sum.rating || 0;
        const averageRating = ratingCount > 0 ? ratingSum / ratingCount : 0;

        // Update product with calculated stats
        await prisma.product.update({
          where: { id: product.id },
          data: {
            ratingCount,
            ratingSum,
            averageRating: parseFloat(averageRating.toFixed(2)),
          },
        });

        console.log(
          `✓ ${product.name} - Rating: ${averageRating.toFixed(
            2
          )} | Count: ${ratingCount} | Sum: ${ratingSum}`
        );
        updated++;
      } catch (error) {
        console.error(`✗ Error updating ${product.name}:`, error.message);
        errors++;
      }
    }

    console.log(
      `\n\nRecalculation complete! Updated: ${updated}, Errors: ${errors}`
    );
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

recalculateReviewStats();
