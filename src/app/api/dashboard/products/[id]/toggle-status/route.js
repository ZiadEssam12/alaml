import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT: Toggle product status (active/inactive)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isActive },
    });

    const action = isActive ? "تنشيط" : "إلغاء تنشيط";

    return NextResponse.json(
      {
        data: product,
        message: `تم ${action} المنتج بنجاح`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling product status:", error);
    return NextResponse.json(
      { error: "فشل في تغيير حالة المنتج" },
      { status: 500 }
    );
  }
}
