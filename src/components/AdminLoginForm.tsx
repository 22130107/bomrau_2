"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

export function AdminLoginForm() {
  const [state, action, isPending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="w-full max-w-[400px] mx-auto">
      <div className="bg-[rgb(2,6,23)] border border-[rgb(253,230,138)] rounded-2xl p-6 md:p-8">
        <h1 className="text-[rgb(251,191,36)] text-[24px] font-bold text-center mb-6">Đăng nhập Admin</h1>
        {state?.error && (
          <div className="mb-4 px-4 py-3 bg-[rgba(220,38,38,0.15)] border border-[rgb(220,38,38)] rounded-lg text-[rgb(220,38,38)] text-[13px]">{state.error}</div>
        )}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="login-username" className="text-[14px] text-[rgba(238,238,238,0.7)]">Tên đăng nhập</label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              disabled={isPending}
              className="px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="text-[14px] text-[rgba(238,238,238,0.7)]">Mật khẩu</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
              className="px-4 py-3 bg-[rgb(31,41,55)] border border-[rgb(75,85,99)] rounded-lg text-white text-[14px] outline-none focus:border-[rgb(251,191,36)] disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3 bg-[rgb(202,138,4)] hover:bg-[rgb(251,191,36)] disabled:opacity-60 text-black font-bold text-[16px] rounded-lg transition-colors cursor-pointer"
          >
            {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </div>
      </div>
    </form>
  );
}
