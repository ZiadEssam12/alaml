import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get all reviews for a product (with pagination)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }
    const totalReviews = await prisma.review.count({ where: { productId } });
    const maxPage = Math.ceil(totalReviews / limit);
    const reviews = await prisma.review.findMany({
      where: { productId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(
      { data: reviews, page, maxPage, message: "Reviews fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST: Create a review (user can only comment once per product)
export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, productName, userId, userName, rating, comment } = body;
    if (!productId || !userId) {
      return NextResponse.json(
        { error: "productId and userId are required" },
        { status: 400 }
      );
    }
    // Check if user already commented on this product
    const existing = await prisma.review.findFirst({
      where: { productId, userId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "User has already reviewed this product" },
        { status: 409 }
      );
    }
    const review = await prisma.review.create({
      data: { productId, productName, userId, userName, rating, comment },
    });
    return NextResponse.json(
      { data: review, message: "Review created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
