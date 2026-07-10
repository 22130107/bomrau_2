import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { getSession } from "@/lib/session";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const q = searchParams.get("q");

    let query = "SELECT * FROM options WHERE 1=1";
    const params: any[] = [];

    if (type) {
      query += " AND type = ?";
      params.push(type);
    }

    if (q) {
      query += " AND name LIKE ?";
      params.push(`%${q}%`);
    }

    query += " ORDER BY sort_order, id";

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { type, name } = body;
    if (!type || !name) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const [result] = await pool.query<ResultSetHeader>("INSERT INTO options (type, name) VALUES (?, ?)", [type, name]);
    return NextResponse.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, name } = body;
    if (!id || !name) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    await pool.query("UPDATE options SET name = ? WHERE id = ?", [name, id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    await pool.query("DELETE FROM options WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
