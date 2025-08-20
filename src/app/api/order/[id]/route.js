import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Get a single order by id
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Order id is required" },
        { status: 400 }
      );
    }
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(
      { data: order, message: "Order fetched successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT: Update an order by id
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Order id is required" },
        { status: 400 }
      );
    }
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingStreet,
      shippingCity,
      shippingZipCode,
      subtotal,
      shippingCost,
      discount,
      finalAmount,
      paymentMethod,
      status,
      trackingNumber,
      shippingCompanyURL,
      notes,
    } = body;
    const order = await prisma.order.update({
      where: { id },
      data: {
        customerName,
        customerEmail,
        customerPhone,
        shippingStreet,
        shippingCity,
        shippingZipCode,
        subtotal,
        shippingCost,
        discount,
        finalAmount,
        paymentMethod,
        status,
        trackingNumber,
        shippingCompanyURL,
        notes,
      },
      include: { items: true },
    });
    return NextResponse.json(
      { data: order, message: "Order updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE: Mark an order as cancelled by id (soft delete)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Order id is required" },
        { status: 400 }
      );
    }
    const order = await prisma.order.update({
      where: { id },
      data: { status: "cancelled" },
      include: { items: true },
    });
    return NextResponse.json(
      { data: order, message: "Order cancelled successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
