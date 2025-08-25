import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const q = searchParams.get("q") || "";

    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: "Page and limit must be positive integers" },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // Optional: Order by creation date
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { seoTitle: { contains: q, mode: "insensitive" } },
          ],
        },
      }),
      prisma.category.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        data: categories,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
        message: "Categories fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { name, seoTitle } = data;
    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }
    if (seoTitle && typeof seoTitle !== "string") {
      return NextResponse.json(
        { error: "SEO title must be a string" },
        { status: 400 }
      );
    }

    if (!data.status) {
      data.status = "active";
    }

    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [{ name: name }, { seoTitle: seoTitle }],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category with this name or SEO title already exists" },
        { status: 400 }
      );
    }

    data.seoTitle = slugify(name, {
      decamelize: function (text) {
        return text;
      },
      locale: "ar",
    });

    const newCategory = await prisma.category.create({
      data: data,
    });

    return NextResponse.json(
      {
        data: newCategory,
        message: "Category created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
