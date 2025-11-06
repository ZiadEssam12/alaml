import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
