import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const cookieKey =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function GET(request, { params }) {
  try {
    const session = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      salt: cookieKey,
      cookieName: cookieKey,
    });

    const role = session?.role;
    const userId = session?.id;

    console.log("Session data:", session);
    console.log("User ID:", userId);

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    // First get the product to ensure it exists
    const product = await prisma.product.findUnique({
      where: { slug: id },
      include: {
        category: true,
      },
    });

    if (!product || (product.isActive === false && role !== "admin")) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get similar products
    const similarProducts = await prisma.product.findMany({
      where: {
        categoryID: product.categoryID,
        NOT: { id: product.id },
      },
      take: 4,
    });

    // Check user permissions if authenticated
    let hasPurchased = false;
    let hasReviewed = false;

    if (userId) {
      // Check if user has purchased the product
      const purchase = await prisma.order.findFirst({
        where: {
          userId,
          status: { in: ["shipped", "delivered"] },
          items: {
            some: {
              productId: product.id,
            },
          },
        },
        select: { id: true },
      });
      hasPurchased = !!purchase;
      console.log("User has purchased:", !!purchase);

      // Check if user has reviewed the product
      const review = await prisma.review.findFirst({
        where: { userId, productId: product.id },
        select: { id: true },
      });
      hasReviewed = !!review;
      console.log("User has reviewed:", !!review);
    }

    console.log("Final results:", {
      userId,
      userHasPurchased: hasPurchased,
      userHasReviewed: hasReviewed,
      canReview: hasPurchased && !hasReviewed,
    });

    const userPermissions = userId
      ? {
          hasPurchased: hasPurchased,
          hasReviewed: hasReviewed,
          canReview: hasPurchased && !hasReviewed,
        }
      : null;

    return NextResponse.json(
      {
        data: {
          product,
          similarProducts,
          userPermissions: userPermissions,
        },
        message: "Product fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

async function checkUserPurchase(userId, productId) {
  try {
    const purchase = await prisma.order.findFirst({
      where: {
        userId,
        status: { in: ["shipped", "delivered"] },
        items: {
          some: {
            productId: productId,
          },
        },
      },
      select: { id: true },
    });

    console.log(
      "Purchase check for user:",
      userId,
      "product:",
      productId,
      "result:",
      !!purchase
    );

    return !!purchase;
  } catch (error) {
    console.error("Error checking user purchase:", error);
    return false;
  }
}

// Helper function to check if user has reviewed the product
async function checkUserReview(userId, productId) {
  try {
    const review = await prisma.review.findFirst({
      where: { userId, productId },
      select: { id: true },
    });

    return !!review;
  } catch (error) {
    console.error("Error checking user review:", error);
    return false;
  }
}
