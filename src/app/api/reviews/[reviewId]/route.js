import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import * as yup from "yup";

const updateReviewSchema = yup.object().shape({
  rating: yup
    .number()
    .required("التقييم مطلوب")
    .min(1, "يجب أن يكون التقييم على الأقل 1")
    .max(5, "يجب أن يكون التقييم بحد أقصى 5"),
  comment: yup.string().required("التعليق مطلوب"),
});

// PUT /api/reviews/[reviewId]
export async function PUT(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
  }

  const { reviewId } = await params;

  // Check if review exists and belongs to the user
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, status: true },
  });

  if (!existingReview) {
    return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
  }

  // Ensure only the review owner can update their review
  if (existingReview.userId !== session.user.id) {
    return NextResponse.json(
      { error: "غير مصرح لك بتعديل هذا التقييم" },
      { status: 403 }
    );
  }

  const body = await req.json();

  try {
    await updateReviewSchema.validate(body);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { rating, comment } = body;

  // Update the review and reset status to pending for re-moderation
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating,
      comment,
      status: "pending", // Reset to pending after update for re-moderation
    },
  });

  return NextResponse.json({ data: updatedReview }, { status: 200 });
}

// DELETE /api/reviews/[reviewId]
export async function DELETE(req, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
  }

  const { reviewId } = await params;

  // Check if review exists and belongs to the user
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true },
  });

  if (!existingReview) {
    return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
  }

  // Ensure only the review owner can delete their review
  if (existingReview.userId !== session.user.id) {
    return NextResponse.json(
      { error: "غير مصرح لك بحذف هذا التقييم" },
      { status: 403 }
    );
  }

  // Delete the review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  return NextResponse.json(
    { message: "تم حذف التقييم بنجاح" },
    { status: 200 }
  );
}
