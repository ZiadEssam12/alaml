import prisma from "@/lib/prisma";
import { getCurrentSessionData } from "@/lib/utils";
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
    const session = await getCurrentSessionData(request);

    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "يوجد مستخدم بهذا البريد الإلكتروني" },
        { status: 400 }
      );
    }

    // Create new admin user
    const newAdmin = await prisma.user.create({
      data: {
        email,
        name: name || "admin",
        role: "admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "فشل في إنشاء المشرف" }, { status: 500 });
  }
}
