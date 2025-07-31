import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    console.log("Fetched categories:", categories);
    return NextResponse.json(
      {
        data: categories,
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

export async function PUT(request) {
  try {
    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id: id },
      data: data,
    });

    return NextResponse.json(
      {
        data: updatedCategory,
        message: "Category updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    await prisma.category.delete({
      where: { id: id },
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
