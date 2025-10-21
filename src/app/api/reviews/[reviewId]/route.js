import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as yup from "yup";
import { getUserTokenSSR } from "@/lib/auth-helpers";
import { updateProductReviewStats } from "@/lib/review-stats";
import { classifyReview } from "@/lib/utils";

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
  const { reviewId } = await params;

  const session = await getUserTokenSSR(req);

  // Check if review exists and belongs to the user
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, status: true, productId: true },
  });

  if (!existingReview) {
    return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
  }

  // Ensure only the review owner can update their review
  if (existingReview.userId !== session.id) {
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

  // Get product description for classification
  const product = await prisma.product.findUnique({
    where: { id: existingReview.productId },
    select: { description: true, name: true },
  });

  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  // Classify the review using AI
  let status = "pending";
  const { classification, reason } = await classifyReview(
    product.description,
    comment
  );

  if (classification === "spam") {
    status = "rejected";
  }
  if (classification === "natural") {
    status = "approved";
  }

  // Update the review and set status based on classification
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating,
      comment,
      status,
      reason,
    },
  });

  // Update denormalized review stats on product
  await updateProductReviewStats(existingReview.productId);

  return NextResponse.json({ data: updatedReview }, { status: 200 });
}

// DELETE /api/reviews/[reviewId]
export async function DELETE(req, { params }) {
  const { reviewId } = await params;
  const session = await getUserTokenSSR(req);

  // Check if review exists and belongs to the user
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, userId: true, productId: true },
  });

  if (!existingReview) {
    return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
  }

  // Ensure only the review owner can delete their review
  if (existingReview.userId !== session.id) {
    return NextResponse.json(
      { error: "غير مصرح لك بحذف هذا التقييم" },
      { status: 403 }
    );
  }

  // Delete the review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update denormalized review stats on product
  await updateProductReviewStats(existingReview.productId);

  return NextResponse.json(
    { message: "تم حذف التقييم بنجاح" },
    { status: 200 }
  );
}
