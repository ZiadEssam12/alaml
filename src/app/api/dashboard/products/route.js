import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { productKeywordsCreator } from "@/lib/utils";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);
    const q = searchParams.get("q") || "";
    const totalProducts = await prisma.product.count();
    const maxPage = Math.ceil(totalProducts / limit);

    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        data: {
          products,
          categories,
        },
        pagination: {
          page,
          totalPages: maxPage,
          total: totalProducts,
        },
        message: "Products fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      imageUrls,
      stockQuantity,
      maxQuantityPerUser,
      categoryID,
    } = body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrls,
        stockQuantity,
        maxQuantityPerUser: maxQuantityPerUser ?? 1,
        categoryID,
        slug: slugify(name, { lower: true }),
      },
    });

    // Generate keywords in parallel (non-blocking)
    // Don't await this - let it run in the background
    (async () => {
      try {
        const result = await productKeywordsCreator({
          productTitle: name,
          productDescription: description,
        });

        if (result && result.keywords && Array.isArray(result.keywords)) {
          await prisma.product.update({
            where: { id: product.id },
            data: {
              keywords: result.keywords,
            },
          });
          console.log(`✅ Keywords generated for product: ${name}`);
        }
      } catch (error) {
        console.error(`❌ Error generating keywords for ${name}:`, error);
      }
    })();

    return NextResponse.json(
      { data: product, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
