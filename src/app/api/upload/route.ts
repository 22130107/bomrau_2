import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";
import fs from "fs";

export async function POST(req: Request) {


  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "uploads");
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uniqueSuffix = crypto.randomBytes(6).toString("hex");
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${uniqueSuffix}-${originalName}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({ url: `/api/uploads/${filename}` });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Lỗi upload" }, { status: 500 });
  }
}
