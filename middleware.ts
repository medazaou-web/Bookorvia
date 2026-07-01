import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Protect dashboard and admin routes
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  if (!isProtectedRoute) return NextResponse.next();

  // Dev-only: log cookies so developer can inspect them
  if (process.env.NODE_ENV !== "production") {
    const cookieHeader = req.headers.get("cookie") || "(no cookies)";
    console.log(`[middleware] ${pathname} request cookies:`, cookieHeader.substring(0, 50));
  }

  // Call our internal refresh endpoint to attempt refreshing Supabase auth
  try {
    const refreshUrl = new URL("/api/auth/refresh", req.url).toString();
    const refreshRes = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    // If refresh returned set-cookie headers, forward them to the client
    const setCookie = refreshRes.headers.get("set-cookie");
    const res = NextResponse.next();
    if (setCookie) {
      res.headers.append("set-cookie", setCookie);
    }
    return res;
  } catch (e) {
    // Ignore failures and continue
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
