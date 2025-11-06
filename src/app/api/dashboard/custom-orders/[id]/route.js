import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Fetch single custom order (admin only)
export async function GET(request, { params }) {
  try {
    const session = await getUserTokenSSR(request);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "غير مصرح له بالوصول" },
        { status: 403 }
      );
    }

    const orderId = (await params).id;

    const customOrder = await prisma.customOrder.findUnique({
      where: { id: orderId },
    });

    if (!customOrder) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ data: customOrder }, { status: 200 });
  } catch (error) {
    console.error("Error fetching custom order:", error);
    return NextResponse.json({ error: "فشل في جلب الطلب" }, { status: 500 });
  }
}

// PUT - Update custom order (admin only)
export async function PUT(request, { params }) {
  try {
    const session = await getUserTokenSSR(request);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "غير مصرح له بالوصول" },
        { status: 403 }
      );
    }

    const orderId = (await params).id;
    const body = await request.json();
    const {
      name,
      email,
      phone,
      productType,
      description,
      quantity,
      budget,
      url,
      status,
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !productType || !description) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ["in_progress", "done", "refused"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "حالة غير صحيحة" }, { status: 400 });
    }

    const updatedOrder = await prisma.customOrder.update({
      where: { id: orderId },
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productType,
        description: description.trim(),
        quantity: quantity ? parseInt(quantity) : null,
        budget: budget ? parseFloat(budget) : null,
        url: url && url.trim() ? url.trim() : null,
        status,
      },
    });

    return NextResponse.json(
      { data: updatedOrder, message: "تم تحديث الطلب بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating custom order:", error);
    return NextResponse.json({ error: "فشل في تحديث الطلب" }, { status: 500 });
  }
}

// DELETE - Delete custom order (set status to refused) (admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getUserTokenSSR(request);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "غير مصرح له بالوصول" },
        { status: 403 }
      );
    }

    const orderId = (await params).id;

    const updatedOrder = await prisma.customOrder.update({
      where: { id: orderId },
      data: { status: "refused" },
    });

    return NextResponse.json(
      { data: updatedOrder, message: "تم رفض الطلب بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting custom order:", error);
    return NextResponse.json({ error: "فشل في رفض الطلب" }, { status: 500 });
  }
}
