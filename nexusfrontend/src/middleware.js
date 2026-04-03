import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:5000"
).replace(/\/$/, "");

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!meResponse.ok) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
