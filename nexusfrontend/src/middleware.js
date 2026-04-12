import { NextResponse } from "next/server";

export async function middleware(request) {
  const hasFrontendSession = request.cookies.get("nn_session")?.value === "1";

  if (!hasFrontendSession) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
