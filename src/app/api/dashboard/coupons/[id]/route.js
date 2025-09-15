import { updateCouponSchema } from "@/schema/coupon";
import { NextResponse } from "next/server";

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
