import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    
    let query = `
      SELECT p.id, p.title, p.image_url, p.price, p.original_price, p.discount_percent, 
             p.fake_sold_count, p.fake_remaining_count, p.status, p.is_pinned,
             p.pet_tim, p.san_tim, p.chuong, p.extra_info
      FROM products p
      WHERE p.status = 'available'
    `;
    const params: any[] = [];
    
    if (q) {
      query += " AND (p.title LIKE ? OR p.pet_tim LIKE ? OR p.san_tim LIKE ? OR p.chuong LIKE ?)";
      const likeQ = `%${q}%`;
      params.push(likeQ, likeQ, likeQ, likeQ);
    }
    
    query += " ORDER BY p.is_pinned DESC, p.id DESC";
    
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json({ products: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, image_url, price, original_price, discount_percent, fake_sold_count, fake_remaining_count, status, is_pinned, pet_tim, san_tim, chuong, extra_info, images } = body;

    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO products (title, image_url, price, original_price, discount_percent, fake_sold_count, fake_remaining_count, status, is_pinned, pet_tim, san_tim, chuong, extra_info) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, image_url, price, original_price, discount_percent, fake_sold_count, fake_remaining_count, status, is_pinned, pet_tim, san_tim, chuong, extra_info]
    );

    const productId = result.insertId;

    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await pool.query(
          "INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)",
          [productId, images[i], i]
        );
      }
    }

    return NextResponse.json({ success: true, id: productId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, image_url, price, original_price, discount_percent, fake_sold_count, fake_remaining_count, status, is_pinned, pet_tim, san_tim, chuong, extra_info, images } = body;

    await pool.query(
      `UPDATE products SET title=?, image_url=?, price=?, original_price=?, discount_percent=?, fake_sold_count=?, fake_remaining_count=?, status=?, is_pinned=?, pet_tim=?, san_tim=?, chuong=?, extra_info=? WHERE id=?`,
      [title, image_url, price, original_price, discount_percent, fake_sold_count, fake_remaining_count, status, is_pinned, pet_tim, san_tim, chuong, extra_info, id]
    );

    await pool.query("DELETE FROM product_images WHERE product_id = ?", [id]);
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await pool.query(
          "INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)",
          [id, images[i], i]
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { ids } = body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const placeholders = ids.map(() => "?").join(",");
    await pool.query(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
