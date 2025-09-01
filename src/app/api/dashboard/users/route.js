import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "user";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const q = searchParams.get("q") || "";

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where = {
      role: role,
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }),
    };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
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
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    const maxPage = Math.ceil(totalCount / pageSize);

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        pageSize,
        totalCount,
        maxPage,
      },
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create new admin user
    const newAdmin = await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0], // Use email prefix as default name
        role: "admin",
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

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }
}
