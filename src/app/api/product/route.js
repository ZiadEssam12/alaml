import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(process.env.DATABASE_PAGINATION_LIMIT || 10);

    const totalProducts = await prisma.product.count();
    const maxPage = Math.ceil(totalProducts / limit);

    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(
      {
        data: products,
        page,
        maxPage,
        message: "Products fetched successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST: Create a new product
export async function POST(request) {
  try {
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

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrls,
        stockQuantity,
        maxQuantityPerUser: maxQuantityPerUser ?? 5,
        categoryID,
      },
    });

    return NextResponse.json(
      { data: product, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// PUT: Update a product by id
export async function PUT(request) {
  try {
    // const {id} = GET from search params
    const body = await request.json();
    const {
      id,
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
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product id is required" },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
