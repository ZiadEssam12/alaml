import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/dashboard/order?page=1&pageSize=10
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const skip = (page - 1) * pageSize;
  const q = searchParams.get("q")?.trim();

  // Build search filter
  let where = {};
  if (q) {
    where = {
      OR: [
        { id: { contains: q } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerEmail: { contains: q, mode: "insensitive" } },
      ],
    };
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip,
      take: pageSize,
      include: {
        user: true,
        items: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({
    data: orders,
    pagination: {
      page,
      pageSize,
      total,
      maxPage: Math.ceil(total / pageSize),
    },
  });
}
