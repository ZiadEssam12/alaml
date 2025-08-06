import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: Create a new user
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, role } = body;
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "user",
      },
    });
    return NextResponse.json(
      { data: user, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
