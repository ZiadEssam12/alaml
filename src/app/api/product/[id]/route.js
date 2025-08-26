import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const cookieKey =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function GET(request, { params }) {
  try {
    const session = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      salt: cookieKey,
      cookieName: cookieKey,
    });

    const role = session?.role;

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

    if (!product || (product.isActive === false && role !== "admin")) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { data: product, message: "Product fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.log("error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
