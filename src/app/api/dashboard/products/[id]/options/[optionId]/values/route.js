import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { CreateOptionValueInput } from "@/schema/dashboard/productOptions";

export async function POST(request, { params }) {
  try {
    const { id: productId, optionId } = await params;

    if (!productId) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    if (!optionId) {
      return NextResponse.json({ error: "معرف الخيار مطلوب" }, { status: 400 });
    }

    // Check if option exists and belongs to this product
    const option = await prisma.productOption.findFirst({
      where: {
        id: optionId,
        productId,
      },
      select: { id: true, name: true },
    });

    if (!option) {
      return NextResponse.json({ error: "الخيار غير موجود" }, { status: 404 });
    }

    const body = await request.json();

    // Validate with Yup schema
    let validated;
    try {
      validated = await CreateOptionValueInput.validate(body, { abortEarly: false });
    } catch (validationError) {
      return NextResponse.json(
        { error: "بيانات غير صالحة", details: validationError.errors },
        { status: 400 }
      );
    }

    // Check for duplicate value within this option
    const existingValue = await prisma.productOptionValue.findFirst({
      where: {
        optionId,
        value: validated.value,
      },
      select: { id: true },
    });

    if (existingValue) {
      return NextResponse.json(
        { error: "يوجد قيمة بنفس الاسم لهذا الخيار" },
        { status: 409 }
      );
    }

    // Compute next position for the value
    const maxPos = await prisma.productOptionValue.aggregate({
      where: { optionId },
      _max: { position: true },
    });
    const nextPosition = (maxPos._max.position ?? -1) + 1;

    // Create the value
    const newValue = await prisma.productOptionValue.create({
      data: {
        optionId,
        value: validated.value,
        hex: validated.hex ?? null,
        imageUrl: validated.imageUrl ?? null,
        position: validated.position ?? nextPosition,
      },
      select: {
        id: true,
        value: true,
        hex: true,
        imageUrl: true,
        position: true,
      },
    });

    return NextResponse.json({ value: newValue }, { status: 201 });
  } catch (error) {
    console.error("Error creating option value:", error);

    // Handle Prisma unique constraint violations
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "تعارض في البيانات (قيمة مكررة)" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "حدث خطأ أثناء إنشاء القيمة" },
      { status: 500 }
    );
  }
}