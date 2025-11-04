import prisma from "../src/lib/prisma.js";
import { productKeywordsCreator } from "../src/lib/utils.js";

async function generateKeywordsForProducts() {
  try {
    console.log("🔍 Fetching products without keywords...");

    // Get all products without keywords or with empty keywords array
    const productsWithoutKeywords = await prisma.product.findMany({
      where: {
        OR: [{ keywords: { equals: [] } }, { keywords: { isEmpty: true } }],
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
      },
    });

    console.log(
      `📦 Found ${productsWithoutKeywords.length} products without keywords\n`
    );

    if (productsWithoutKeywords.length === 0) {
      console.log("✅ All products already have keywords!");
      process.exit(0);
    }

    let successCount = 0;
    let errorCount = 0;

    for (const product of productsWithoutKeywords) {
      try {
        console.log(`⏳ Generating keywords for: ${product.name}`);

        const result = await productKeywordsCreator({
          productTitle: product.name,
          productDescription: product.description,
        });

        if (result && result.keywords && Array.isArray(result.keywords)) {
          // Update product with generated keywords
          await prisma.product.update({
            where: { id: product.id },
            data: {
              keywords: result.keywords,
            },
          });

          console.log(
            `✅ Updated: ${product.name} with ${result.keywords.length} keywords`
          );
          console.log(
            `   Keywords: ${result.keywords.slice(0, 5).join(", ")}...`
          );
          successCount++;
        } else {
          console.log(`❌ Failed to generate keywords for: ${product.name}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${product.name}:`, error.message);
        errorCount++;
      }

      // Add delay to avoid API rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log("\n📊 Summary:");
    console.log(`✅ Successfully updated: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log(`\n🎉 Keyword generation complete!`);
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

generateKeywordsForProducts();
