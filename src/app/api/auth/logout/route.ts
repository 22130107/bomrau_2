import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

// POST thay vì GET — tránh CSRF, tránh prefetch trigger logout
export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[LOGOUT ERROR]", err);
    return NextResponse.json({ success: true }); // Vẫn trả success để client redirect
  }
}

// Giữ GET để tương thích với link logout cũ, nhưng redirect về login
export async function GET(req: Request) {
  try {
    await clearSessionCookie();
  } catch {
    // Ignore errors during logout
  }
  return NextResponse.redirect(new URL("/login", req.url));
}
