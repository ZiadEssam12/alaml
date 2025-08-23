import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";

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
