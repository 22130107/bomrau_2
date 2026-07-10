import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminContent, AdminProduct } from "@/components/AdminContent";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const metadata: Metadata = {
  title: "Quản Trị - Bomrau UI Demo",
  description: "Trang quản trị (Demo)",
  robots: "noindex, nofollow",
};

export const revalidate = 0; // Dynamic rendering

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const username = (session.username as string) || "Admin";

  const [productRows] = await pool.query<RowDataPacket[]>(`
    SELECT p.id, p.title, p.image_url, 
           p.price, p.original_price, p.discount_percent, p.fake_sold_count, p.fake_remaining_count, p.status, p.is_pinned,
           p.pet_tim, p.san_tim, p.chuong, p.extra_info
    FROM products p
    ORDER BY p.is_pinned DESC, p.id DESC
  `);

  const productIds = productRows.map(row => row.id);
  let imagesMap = new Map<number, string[]>();
  if (productIds.length > 0) {
    const placeholders = productIds.map(() => "?").join(",");
    const [imageRows] = await pool.query<RowDataPacket[]>(
      `SELECT product_id, image_url FROM product_images WHERE product_id IN (${placeholders}) ORDER BY sort_order, id`,
      productIds
    );
    for (const row of imageRows) {
      const existing = imagesMap.get(row.product_id) || [];
      existing.push(row.image_url);
      imagesMap.set(row.product_id, existing);
    }
  }

  const initialProducts: AdminProduct[] = productRows.map(row => ({
    id: row.id,
    title: row.title,
    image_url: row.image_url || "",
    images: imagesMap.get(row.id) || (row.image_url ? [row.image_url] : []),
    original_price: Number(row.original_price) || 0,
    price: Number(row.price),
    discount_percent: Number(row.discount_percent) || 0,
    fake_sold_count: Number(row.fake_sold_count) || 0,
    fake_remaining_count: Number(row.fake_remaining_count) || 0,
    status: row.status as "available" | "hidden",
    is_pinned: Boolean(row.is_pinned),
    pet_tim: row.pet_tim || "",
    san_tim: row.san_tim || "",
    chuong: row.chuong || "",
    extra_info: row.extra_info || ""
  }));

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-nunito)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[rgb(51,65,85)] bg-[rgb(2,6,23)] text-white">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[14px] font-medium text-slate-300">
            Xin chào, <strong className="text-[rgb(251,191,36)]">{username}</strong>
          </span>
        </div>
        <form action={logoutAction}>
          <button 
            type="submit" 
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-rose-900/30 cursor-pointer"
          >
            Đăng xuất
          </button>
        </form>
      </header>
      <main className="flex-1 py-6 md:py-10 px-4 bg-[rgb(15,23,42)]">
        <AdminContent initialProducts={initialProducts} />
      </main>
    </div>
  );
}
