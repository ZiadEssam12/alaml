import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next"; // Fixed import
import { authOptions } from "@/lib/auth"; // Add your auth config
import * as yup from "yup";

const reviewSchema = yup.object().shape({
  productId: yup.string().required("معرف المنتج مطلوب"),
  rating: yup
    .number()
    .required("التقييم مطلوب")
    .min(1, "يجب أن يكون التقييم على الأقل 1")
    .max(5, "يجب أن يكون التقييم بحد أقصى 5"),
  comment: yup.string().required("التعليق مطلوب"),
});

// POST /api/reviews
export async function POST(req) {
  // Fixed: Use getServerSession for API routes
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "غير مصرح لك" }, { status: 401 });
  }

  const body = await req.json();

  try {
    await reviewSchema.validate(body);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { productId, rating, comment } = body;

  // Fixed: Check if product exists first
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true },
  });

  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  // Fixed: Correct query structure for order items
  const hasPurchased = await prisma.order.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["shipped", "delivered"] },
      items: {
        some: {
          productId: productId, // This matches OrderItem.productId
        },
      },
    },
  });

  if (!hasPurchased) {
    return NextResponse.json(
      { error: "يجب عليك شراء المنتج قبل ترك تقييم" },
      { status: 403 }
    );
  }

  // Check if user already submitted a review for the product
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  if (existingReview) {
    return NextResponse.json(
      { error: "لقد قمت بتقييم هذا المنتج من قبل" },
      { status: 403 }
    );
  }

  // Create the review with product name from database
  const review = await prisma.review.create({
    data: {
      productId,
      productName: product.name, // Use actual product name from database
      userId: session.user.id,
      userName: session.user.name,
      rating,
      comment,
      status: "pending", // Default status
    },
  });

  return NextResponse.json({ data: review }, { status: 201 });
}
