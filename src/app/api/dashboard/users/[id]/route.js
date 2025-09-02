import prisma from "@/lib/prisma";
import { getCurrentSessionData } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const session = await getCurrentSessionData(request);

    const { id } = await params;
    const { name, email } = await request.json();

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      });

      if (emailTaken) {
        return NextResponse.json(
          { error: "يوجد مستخدم آخر بنفس البريد الإلكتروني" },
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
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "فشل في تحديث المستخدم" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSessionData(request);

    const { id } = await params;

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (id === session.id) {
      return NextResponse.json(
        { error: "لا يمكنك حذف حسابك الخاص" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "تم حذف المستخدم بنجاح" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "فشل في حذف المستخدم" }, { status: 500 });
  }
}
