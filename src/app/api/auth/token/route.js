import { getUserTokenFromHeaders } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = await getUserTokenFromHeaders();
    return NextResponse.json({ token: token }, { status: 200 });
  } catch (error) {
    console.error("Error getting token:", error);
    return NextResponse.json({ error: "Failed to get token" }, { status: 500 });
  }
}
