import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET || "secret-key-bomrau";
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes
  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(sessionCookie, key, {
        algorithms: ["HS256"],
      });

      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch {
      // Token expired or invalid
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  // If already logged in, redirect /login to /admin
  if (pathname === "/login") {
    const sessionCookie = request.cookies.get("session")?.value;
    if (sessionCookie) {
      try {
        const { payload } = await jwtVerify(sessionCookie, key, {
          algorithms: ["HS256"],
        });
        if (payload.role === "admin") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } catch {
        // Invalid token, let them see login page
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
