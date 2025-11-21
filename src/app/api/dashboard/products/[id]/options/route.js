import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateOptionInput } from "@/schema/dashboard/productOptions";

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
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    const body = await request.json();

    // For creating option without initial value, we'll create just the option
    // If value is provided, create both option and value together
    const hasInitialValue = body.value && body.value.trim();

    // Validate based on whether we have an initial value
    if (hasInitialValue) {
      // Validate with Yup schema (requires value)
      try {
        await CreateOptionInput.validate(body, { abortEarly: false });
      } catch (validationError) {
        return NextResponse.json(
          { error: "بيانات غير صالحة", details: validationError.errors },
          { status: 400 }
        );
      }
    } else {
      // Only validate name and presentation
      if (!body.name || !body.name.trim()) {
        return NextResponse.json(
          { error: "اسم الخيار مطلوب" },
          { status: 400 }
        );
      }
    }

    // Check for duplicate option name per product
    const existing = await prisma.productOption.findFirst({
      where: { productId, name: body.name },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "يوجد خيار بنفس الاسم لهذا المنتج" },
        { status: 409 }
      );
    }

    // Compute next position for the option
    const maxPos = await prisma.productOption.aggregate({
      where: { productId },
      _max: { position: true },
    });
    const nextPosition = (maxPos._max.position ?? -1) + 1;

    // Create option (with or without initial value)
    const option = await prisma.productOption.create({
      data: {
        productId,
        name: body.name,
        presentation: body.presentation ?? null,
        position: nextPosition,
        ...(hasInitialValue && {
          values: {
            create: {
              value: body.value,
              hex: body.hex ?? null,
              imageUrl: body.imageUrl ?? null,
              position: body.position ?? 0,
            },
          },
        }),
      },
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
    });

    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    console.error("Error creating option:", error);

    // Handle Prisma unique constraint violations
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "تعارض في البيانات (قيمة مكررة)" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء الخيار" },
      { status: 500 }
    );
  }
}
