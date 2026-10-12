import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";

export async function GET(request) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ user: null });
  }

  if (session.role === "admin") {
    return NextResponse.json({ user: { email: session.email, role: "admin" } });
  }

  await connectDB();
  const user = await User.findById(session.sub);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user._id,
      email: user.email,
      role: "user",
      favouriteCategories: user.favouriteCategories,
    },
  });
}