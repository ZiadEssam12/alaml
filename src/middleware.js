import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const session = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = req.nextUrl;

  console.log("Session:", session);
  console.log("Pathname:", pathname);

  if (session?.role === "admin" && pathname === "/dashboard/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    pathname.startsWith("/dashboard") &&
    pathname !== "/dashboard/login" &&
    (!session || session.role !== "admin")
  ) {
    console.log("Redirecting to /dashboard/login");
    return NextResponse.redirect(new URL("/dashboard/login", req.url));
  }

  if (pathname.startsWith("/api/dashboard") && !session) {
    console.log("Unauthorized API access");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*"],
};
