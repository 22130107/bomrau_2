import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";


// Let's implement a simple mime type resolver
const getMimeType = (ext: string) => {
  const mimes: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml'
  };
  return mimes[ext.toLowerCase()] || 'application/octet-stream';
};

export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: filePathParams } = await params;
  if (!filePathParams || filePathParams.length === 0) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const filename = filePathParams.join("/");
  const filePath = path.join(process.cwd(), "uploads", filename);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": getMimeType(ext),
      "Content-Length": stat.size.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
