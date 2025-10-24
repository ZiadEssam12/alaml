import { getUserTokenSSR } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET: Get all options for a product
 */
export async function GET(request, { params }) {
  try {
    const { productId } = await params;
    const session = await getUserTokenSSR(request);

    if (session?.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const options = await prisma.productOption.findMany({
      where: { productId },
      orderBy: { position: "asc" },
      include: {
        values: {
          orderBy: { position: "asc" },
        },
      },
    });

    return NextResponse.json(
      { data: options, message: "Options fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching options:", error);
    return NextResponse.json(
      { error: "Failed to fetch options" },
      { status: 500 }
    );
  }
}
