// endpoint to return the user token from cookies
import { getUserTokenFromHeaders } from "@/lib/auth-helpers";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const token = await getUserTokenFromHeaders(req);
    return NextResponse.json({ token });
  } catch (error) {
    return NextResponse.json(
      { error: "فشل في جلب رمز المستخدم" },
      { status: 500 }
    );
  }
}
