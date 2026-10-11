import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing. Add it to .env.local");
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const COOKIE_NAME = "token";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null; // expired, tampered or invalid
  }
}

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SEVEN_DAYS,
  });
}

// Reads the token from the "Authorization: Bearer" header (mobile / API clients)
// or from the cookie (web pages).
export async function getSession(request) {
  let token = null;
  const header = request.headers.get("authorization");

  if (header && header.startsWith("Bearer ")) {
    token = header.slice(7);
  } else {
    const jar = await cookies();
    token = jar.get(COOKIE_NAME)?.value ?? null;
  }

  return token ? verifyToken(token) : null;
}

// Usage in an API route:
//   const { session, error } = await requireRole(request, "admin");
//   if (error) return error;
export async function requireRole(request, role) {
  const session = await getSession(request);
  if (!session) {
    return { error: Response.json({ error: "Please log in" }, { status: 401 }) };
  }
  if (session.role !== role) {
    return { error: Response.json({ error: "Not allowed" }, { status: 403 }) };
  }
  return { session };
}