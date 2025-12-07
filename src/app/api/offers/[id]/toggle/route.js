import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate that isActive is provided
    if (typeof body.isActive !== "boolean") {
      return NextResponse.json(
        { error: "يجب تقديم قيمة isActive صحيحة" },
        { status: 400 }
      );
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { isActive: body.isActive },
    });

    return NextResponse.json(updatedOffer);
  } catch (error) {
    console.error("Error toggling offer status:", error);
    return NextResponse.json(
      { error: "فشل في تحديث حالة العرض" },
      { status: 500 }
    );
  }
}
