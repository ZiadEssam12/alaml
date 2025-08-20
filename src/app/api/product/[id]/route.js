import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a single product by id
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
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

// PUT: Update a product by id
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const {
      name,
      description,
      price,
      imageUrls,
      stockQuantity,
      maxQuantityPerUser,
      categoryID,
    } = body;
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        imageUrls,
        stockQuantity,
        maxQuantityPerUser,
        categoryID,
      },
    });
    return NextResponse.json(
      { data: product, message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a product by id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "معرف المنتج مطلوب" }, { status: 400 });
    }
    await prisma.product.delete({
      where: { id },
    });
    return NextResponse.json(
      { message: "تم حذف المنتج بنجاح" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: "فشل حذف المنتج" }, { status: 500 });
  }
}
