import { createNewCouponSchema } from "@/schema/coupon";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);
  const q = searchParams.get("q") || "";
  const totalCoupons = await prisma.coupon.count();
  const maxPage = Math.ceil(totalCoupons / limit);

  const where = q
    ? {
        OR: [
          { code: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const coupons = await prisma.coupon.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { usages: true },
  });

  return NextResponse.json(
    {
      data: coupons,
      pagination: { page, limit, total: totalCoupons, maxPage },
    },
    { status: 200 }
  );
}

export async function POST(req) {
  const validationresult = await createNewCouponSchema
    .validate(await req.json(), {
      abortEarly: false,
    })
    .catch((err) => {
      const errors = err.errors.map((error) => ({
        message: error,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    });

  const coupon = await prisma.coupon.create({
    data: {
      code: validationresult.code,
      description: validationresult.description,
      type: validationresult.type,
      value: validationresult.value,
      maxUsageCount: validationresult.maxUsageCount,
      perUserUsageCount: validationresult.perUserUsageCount,
      maxDiscountAmount: validationresult.maxDiscountAmount,
      startDate: validationresult.startDate,
      expirationDate: validationresult.expirationDate,
    },
  });

  return NextResponse.json(coupon, { status: 201 });
}
