import { NextResponse } from "next/server";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Retrieve auth token or session marker
  const sessionCookie = request.cookies.get("nn_session")?.value;
  const tokenCookie =
    request.cookies.get("token")?.value ||
    request.cookies.get("jwt")?.value ||
    request.cookies.get("auth_token")?.value;

  const isAuthenticated = Boolean(
    (sessionCookie === "1" || sessionCookie === "true") ||
    (tokenCookie && tokenCookie.length > 10)
  );

  // Protected routes: redirect unauthenticated requests to login
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes: redirect already authenticated users to dashboard
  if (pathname === "/auth" || pathname === "/auth/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
