import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { setSessionCookie } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin" },
        { status: 400 }
      );
    }

    if (typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    // Trim username, giới hạn độ dài
    const trimmedUsername = username.trim();
    if (trimmedUsername.length === 0 || trimmedUsername.length > 50) {
      return NextResponse.json(
        { error: "Tên đăng nhập không hợp lệ" },
        { status: 400 }
      );
    }

    if (password.length > 200) {
      return NextResponse.json(
        { error: "Mật khẩu không hợp lệ" },
        { status: 400 }
      );
    }

    // Query user
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1",
      [trimmedUsername]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Sai tên đăng nhập hoặc mật khẩu" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Verify password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json(
        { error: "Sai tên đăng nhập hoặc mật khẩu" },
        { status: 401 }
      );
    }

    // Tạo session — chỉ lưu thông tin cần thiết, KHÔNG lưu password
    const sessionData = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    await setSessionCookie(sessionData);

    // Response với cache headers để tránh cache
    const response = NextResponse.json({ success: true });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    return response;
  } catch (err) {
    console.error("[LOGIN ERROR]", err);
    return NextResponse.json(
      { error: "Lỗi hệ thống, vui lòng thử lại" },
      { status: 500 }
    );
  }
}
