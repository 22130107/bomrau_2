"use server";

import pool from "@/lib/db";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type LoginState = {
  error?: string;
  success?: boolean;
} | undefined;

export async function loginAction(state: LoginState, formData: FormData): Promise<LoginState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Vui lòng nhập đầy đủ thông tin" };
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length === 0 || trimmedUsername.length > 50) {
    return { error: "Tên đăng nhập không hợp lệ" };
  }

  if (password.length > 200) {
    return { error: "Mật khẩu không hợp lệ" };
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1",
      [trimmedUsername]
    );

    if (rows.length === 0) {
      return { error: "Sai tên đăng nhập hoặc mật khẩu" };
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return { error: "Sai tên đăng nhập hoặc mật khẩu" };
    }

    // Tạo session
    const sessionData = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    await setSessionCookie(sessionData);
  } catch (err) {
    console.error("[LOGIN ACTION ERROR]", err);
    return { error: "Lỗi hệ thống, vui lòng thử lại" };
  }

  // Chuyển hướng sang trang quản trị
  redirect("/admin");
}

export async function logoutAction() {
  try {
    await clearSessionCookie();
  } catch (err) {
    console.error("[LOGOUT ACTION ERROR]", err);
  }
  redirect("/login");
}
