import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const [results, offers] = await prisma.$transaction([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.offer.findMany({
      where: {
        isActive: true,
        startDate: { lte: new Date() },
        expirationDate: { gte: new Date() },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 3,
      select: {
        id: true,
        title: true,
        type: true,
        value: true,
        scope: true,
        productId: true,
        categoryId: true,
        product: {
          select: {
            slug: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  const formattedProducts = results.map((product) => ({
    ...product,
    entityType: "product",
  }));

  const formattedOffers = offers.map((offer) => ({
    ...offer,
    entityType: "offer",
    value: Number(offer.value), // Convert Decimal to Number
  }));

  return NextResponse.json({
    results: [...formattedOffers, ...formattedProducts],
  });
}
