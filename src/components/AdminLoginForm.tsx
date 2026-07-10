"use client";

import { useState } from "react";

export function AdminLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Bắt buộc gửi/nhận cookie cross-origin
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setLoading(false);
        setError(data.error || "Đã có lỗi xảy ra");
        return;
      }

      // QUAN TRỌNG: Dùng window.location thay vì router.push
      // router.push = client-side navigation = có thể dùng cache RSC cũ (chưa có session)
      // window.location = full page reload = server render lại với cookie mới
      window.location.href = "/admin";
    } catch {
      setLoading(false);
      setError("Không thể kết nối đến máy chủ");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[400px] mx-auto">
      <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-6 md:p-8">
        <h1 className="text-[rgb(251,191,36)] text-[24px] font-bold text-center mb-6">Đăng nhập Admin</h1>
        {error && (
          <div className="mb-4 px-4 py-3 bg-[rgba(220,38,38,0.15)] border border-[rgb(220,38,38)] rounded-lg text-[rgb(220,38,38)] text-[13px]">{error}</div>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="login-username" className="text-[14px] text-[rgba(238,238,238,0.7)]">Tên đăng nhập</label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              className="px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="text-[14px] text-[rgba(238,238,238,0.7)]">Mật khẩu</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] disabled:opacity-60 text-black font-bold text-[16px] rounded-lg transition-colors"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </form>
  );
}
