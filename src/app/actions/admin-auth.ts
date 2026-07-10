"use server";

import pool from "@/lib/db";
import { encrypt } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function adminLogin(username: string, password: string) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM users WHERE username = ?", [username]);
    if (rows.length === 0) {
      return { error: "Sai tên đăng nhập hoặc mật khẩu" };
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return { error: "Sai tên đăng nhập hoặc mật khẩu" };
    }

    const sessionData = { id: user.id, username: user.username, role: user.role };
    const encryptedSessionData = await encrypt(sessionData);

    const cookieStore = await cookies();
    cookieStore.set("session", encryptedSessionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Lỗi hệ thống" };
  }
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
