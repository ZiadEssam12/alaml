import { updateCouponSchema } from "@/schema/coupon";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { message: "معرف الكوبون مطلوب" },
      { status: 400 }
    );
  }

  const coupon = await prisma.coupon.findUnique({
    where: { id },
    include: { usages: true },
  });

  if (!coupon) {
    return NextResponse.json({ message: "الكوبون غير موجود" }, { status: 404 });
  }

  return NextResponse.json(coupon, { status: 200 });
}

export async function PUT(req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { message: "معرف الكوبون مطلوب" },
      { status: 400 }
    );
  }
  const data = await req.json();

  // Handle coupon type specific logic
  if (data.type === "fixed") {
    data.maxDiscountAmount = data.value;
  } else if (data.type === "free_shipping") {
    data.value = 0;
    data.maxDiscountAmount = undefined;
  }

  // Ensure minCartAmount has a default value
  if (data.minCartAmount === undefined || data.minCartAmount === null) {
    data.minCartAmount = 0;
  }

  // Convert dates to ISO strings
  if (data.startDate) {
    data.startDate = new Date(data.startDate).toISOString();
  }
  if (data.expirationDate) {
    data.expirationDate = new Date(data.expirationDate).toISOString();
  }

  const validationresult = await updateCouponSchema.validate(data);
  if (validationresult.error) {
    return NextResponse.json(
      { message: validationresult.error.message },
      { status: 400 }
    );
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: validationresult,
  });

  return NextResponse.json(coupon, { status: 200 });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { message: "معرف الكوبون مطلوب" },
      { status: 400 }
    );
  }
  const coupon = await prisma.coupon.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json(coupon, { status: 203 });
}
