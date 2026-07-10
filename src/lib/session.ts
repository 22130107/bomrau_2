import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Bắt buộc phải có JWT_SECRET trong production
const secretKey = process.env.JWT_SECRET;
if (!secretKey && process.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const key = new TextEncoder().encode(secretKey || "dev-secret-key-bomrau-local-only");

// Thời gian session: 7 ngày
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

// Cookie options dùng chung, đảm bảo nhất quán
export function getCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  maxAge: number;
  path: string;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}

export async function encrypt(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(key);
}

export async function decrypt(input: string): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Dùng trong Server Components và API Routes (Node.js runtime)
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

// Dùng trong Middleware (Edge runtime) — nhận cookie value trực tiếp
export async function verifySessionToken(token: string) {
  return await decrypt(token);
}

// Set session cookie — dùng chung cho cả login API
export async function setSessionCookie(sessionData: Record<string, unknown>) {
  const encryptedSessionData = await encrypt(sessionData);
  const cookieStore = await cookies();
  cookieStore.set("session", encryptedSessionData, getCookieOptions());
  return encryptedSessionData;
}

// Xóa session cookie
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0, // Xóa ngay lập tức
    path: "/",
  });
}
