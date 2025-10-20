import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as yup from "yup";
import { cookieKey } from "@/lib/auth-helpers";
import { getToken } from "next-auth/jwt";
import { classifyReview } from "@/lib/utils";
import { updateProductReviewStats } from "@/lib/review-stats";

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
  try {
    const session = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      salt: cookieKey,
      cookieName: cookieKey,
    });

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
      select: { id: true, name: true, description: true },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // Fixed: Correct query structure for order items
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: session.id,
        status: { in: ["shipped", "delivered"] },
        items: {
          some: {
            productId: productId,
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

    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.id,
        productId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "لقد قمت بتقييم هذا المنتج من قبل" },
        { status: 403 }
      );
    }

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

    const review = await prisma.review.create({
      data: {
        productId,
        productName: product.name,
        userId: session.id,
        userName: session.name,
        rating,
        comment,
        status,
        reason,
      },
    });

    // Update denormalized review stats on product
    await updateProductReviewStats(productId);

    if (classification === "spam") {
      return NextResponse.json(
        {
          message: "التقييم تحت المراجعة اليدوبة",
          review,
        },
        { status: 201 }
      );
    }
    return NextResponse.json(
      { data: review, message: "تم قبول التقييم" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Network/server error in review POST:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الشبكة أو الخادم، يرجى المحاولة لاحقاً" },
      { status: 500 }
    );
  }
}
