import { auth } from "@/auth/auth";
import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Fetch custom orders for the current user with pagination
export async function GET(request) {
  const session = await getUserTokenSSR(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || 1;
  const limit = searchParams.get("limit") || 10;
  const skip = (page - 1) * limit;

  try {
    const [customOrders, total] = await Promise.all([
      prisma.customOrder.findMany({
        where: { userId: session.id },
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.customOrder.count({
        where: { userId: session.id },
      }),
    ]);

    return NextResponse.json({ customOrders, total });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Create new custom order (user)
export async function POST(request) {
  try {
    // Verify user is authenticated
    const session = await getUserTokenSSR(request);

    if (!session) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

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
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !productType || !description) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة يجب ملؤها" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "البريد الإلكتروني غير صحيح" },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    if (phone.length < 10) {
      return NextResponse.json(
        { error: "رقم الهاتف غير صحيح" },
        { status: 400 }
      );
    }

    // Validate URL if provided
    if (url && url.trim()) {
      try {
        new URL(url);
      } catch (e) {
        return NextResponse.json(
          { error: "الرابط المدخل غير صحيح" },
          { status: 400 }
        );
      }
    }

    // Create custom order
    const customOrder = await prisma.customOrder.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        productType,
        description: description.trim(),
        quantity: quantity ? parseInt(quantity) : null,
        budget: budget ? parseFloat(budget) : null,
        url: url && url.trim() ? url.trim() : null,
        userId: session.id, // Add userId from session
      },
    });

    return NextResponse.json(
      {
        data: customOrder,
        message: "تم استقبال طلبك بنجاح. سنتواصل معك قريباً",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating custom order:", error);
    return NextResponse.json(
      { error: "فشل في إنشاء الطلب. حاول مرة أخرى" },
      { status: 500 }
    );
  }
}

// PUT - Update custom order status (user can only update their own orders)
export async function PUT(request) {
  try {
    const session = await getUserTokenSSR(request);

    if (!session) {
      return NextResponse.json(
        { error: "يجب تسجيل الدخول أولاً" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");
    const body = await request.json();
    const { status } = body;

    if (!orderId) {
      return NextResponse.json({ error: "معرف الطلب مطلوب" }, { status: 400 });
    }

    if (!status) {
      return NextResponse.json({ error: "الحالة مطلوبة" }, { status: 400 });
    }

    // Find the order
    const customOrder = await prisma.customOrder.findUnique({
      where: { id: orderId },
    });

    if (!customOrder) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // Verify ownership - user can only update their own orders
    if (customOrder.userId !== session.id) {
      return NextResponse.json(
        { error: "غير مصرح لك بتحديث هذا الطلب" },
        { status: 403 }
      );
    }

    // Only allow cancellation of in_progress orders
    if (customOrder.status !== "in_progress") {
      return NextResponse.json(
        { error: "لا يمكن إلغاء الطلبات المكتملة أو المرفوضة" },
        { status: 400 }
      );
    }

    // Update the order status
    const updatedOrder = await prisma.customOrder.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json(
      {
        data: updatedOrder,
        message: "تم إلغاء الطلب بنجاح",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating custom order:", error);
    return NextResponse.json({ error: "فشل في إلغاء الطلب" }, { status: 500 });
  }
}
