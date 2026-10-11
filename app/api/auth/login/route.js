import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { signToken, setAuthCookie } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  await connectDB();
  const user = await User.findOne({ email });
  const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));

  // Same message for "no such user" and "wrong password" so we do not leak which emails exist.
  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signToken({ sub: user._id.toString(), role: "user", email });
  const response = NextResponse.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      favouriteCategories: user.favouriteCategories,
    },
  });
  setAuthCookie(response, token);
  return response;
}