import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secretKey = process.env.JWT_SECRET;
const key = new TextEncoder().encode(secretKey || "dev-secret-key-bomrau-local-only");

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  // ========== BẢO VỆ /admin ==========
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(sessionCookie);
    if (!payload || payload.role !== "admin") {
      // Token hết hạn hoặc không hợp lệ → xóa cookie + redirect
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.set("session", "", { maxAge: 0, path: "/" });
      return response;
    }

    // Token hợp lệ → cho phép truy cập, thêm no-cache header
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // ========== REDIRECT /login nếu đã đăng nhập ==========
  if (pathname === "/login") {
    if (sessionCookie) {
      const payload = await verifyToken(sessionCookie);
      if (payload && payload.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }

    // Thêm no-cache cho trang login
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
