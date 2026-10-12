import { NextResponse } from "next/server";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => null);

  const isAdmin =
    body?.email === process.env.ADMIN_EMAIL &&
    body?.password === process.env.ADMIN_PASSWORD;

  if (!isAdmin) {
    return NextResponse.json({ error: "Invalid admin credentials" }, { status: 401 });
  }

  const token = await signToken({ sub: "admin", role: "admin", email: body.email });
  const response = NextResponse.json({ token });
  setAuthCookie(response, token);
  return response;
}