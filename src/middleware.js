import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const cookieKey =
  process.env.NODE_ENV === "production"
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

export async function middleware(req) {
  const session = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    salt: cookieKey,
    cookieName: cookieKey,
  });
  const { pathname } = req.nextUrl;

  // Allow all users to access /login
  if (pathname.startsWith("/login") && !session.id)
    return NextResponse.redirect(new URL("/login", req.url));

  if (pathname.startsWith("/login") && session.role === "user")
    return NextResponse.redirect(new URL("/", req.url));

  // Restrict /dashboard pages to admin only
  if (
    pathname.startsWith("/dashboard") &&
    (!session || session.role !== "admin")
  ) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Restrict /api/dashboard endpoints to admin only
  if (
    pathname.startsWith("/api/dashboard") &&
    (!session || session.role !== "admin")
  ) {
    console.log("Unauthorized API access");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // All other routes are open
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
