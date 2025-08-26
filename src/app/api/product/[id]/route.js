import { auth } from "@/auth/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a single product by id
export async function GET(request, { params }) {
  try {
    const userSession = request.headers.get("x-user-session");
    const user = userSession ? JSON.parse(userSession) : null;

    console.log("user :", user);

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }
    const product = await prisma.product.findUnique({
      where: { slug: id },
      include: {
        category: true,
      },
    });

    console.log("product :", product);
    if (!product || product.isActive === false) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { data: product, message: "Product fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
