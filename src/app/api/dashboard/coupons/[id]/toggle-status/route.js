import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT: Toggle coupon status (active/inactive)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "معرف الكوبون مطلوب" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    const action = isActive ? "تنشيط" : "إلغاء تنشيط";

    return NextResponse.json(
      {
        data: coupon,
        message: `تم ${action} الكوبون بنجاح`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling coupon status:", error);
    return NextResponse.json(
      { error: "فشل في تغيير حالة الكوبون" },
      { status: 500 }
    );
  }
}
