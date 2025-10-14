import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    // Get pagination params from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "50", 10); // Default 50 (high enough for most cases)

    // Validate pagination params
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: "معاملات الصفحة غير صحيحة" },
        { status: 400 }
      );
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    const skip = (page - 1) * pageSize;

    // Fetch total count and options in parallel
    const [totalOptions, options] = await Promise.all([
      prisma.productOption.count({
        where: { productId: id },
      }),
      prisma.productOption.findMany({
        where: { productId: id },
        orderBy: { position: "asc" },
        skip,
        take: pageSize,
        include: {
          values: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              value: true,
              hex: true,
              imageUrl: true,
              position: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalOptions / pageSize);

    return NextResponse.json(
      {
        options,
        pagination: {
          page,
          pageSize,
          totalOptions,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching options:", error);
    return NextResponse.json(
      { error: "حدث خطأ ما، يرجى المحاولة مرة أخرى" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
  } catch (error) {
    console.log("error:", error.message);
    return NextResponse.json({ error: "حدث خطأ اثناء انشاء الاختيار" });
  }
}
