import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a single review by id
export async function GET(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Review id is required" },
        { status: 400 }
      );
    }
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json(
      { data: review, message: "Review fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}

// PUT: Update a review by id (user can only update their own review)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "Review id is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const { userId, rating, comment } = body;
    // Only allow update if userId matches
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    if (review.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const updated = await prisma.review.update({
      where: { id },
      data: { rating, comment },
    });
    return NextResponse.json(
      { data: updated, message: "Review updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a review by id (user can only delete their own review)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { userId } = await request.json();
    if (!id || !userId) {
      return NextResponse.json(
        { error: "Review id and userId are required" },
        { status: 400 }
      );
    }
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    if (review.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await prisma.review.delete({ where: { id } });
    return NextResponse.json(
      { message: "Review deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
