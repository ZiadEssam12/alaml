import { auth } from "@/auth/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    // Get session from x-user-session header
    const sessionHeader = request.headers.get("x-user-session");
    if (!sessionHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionHeader);
      console.log("secction : ", session);
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { name, email } = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email is already taken by another user
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "Email is already taken" },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Get session from x-user-session header
    const sessionHeader = request.headers.get("x-user-session");
    if (!sessionHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionHeader);
    } catch (error) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "لا يمكنك حذف حسابك الخاص" },
        { status: 400 }
      );
    }

    // Delete user (this will cascade delete related records)
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
