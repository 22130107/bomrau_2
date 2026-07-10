import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { encrypt } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Sai tên đăng nhập hoặc mật khẩu" }, { status: 401 });
    }

    const sessionData = { id: user.id, username: user.username, role: user.role };
    const encryptedSessionData = await encrypt(sessionData);

    const cookieStore = await cookies();
    cookieStore.set("session", encryptedSessionData, {
      httpOnly: true,
      secure: false, // Set to false to avoid any HTTP/HTTPS cookie drop issues
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
