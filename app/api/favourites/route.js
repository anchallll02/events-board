import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireRole } from "@/lib/auth";
import { CATEGORIES } from "@/lib/constants";

export async function GET(request) {
  const { error, session } = await requireRole(request, "user");
  if (error) return error;

  await connectDB();
  const user = await User.findById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }
  return NextResponse.json({ categories: user.favouriteCategories });
}

export async function PUT(request) {
  const { error, session } = await requireRole(request, "user");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const categories = body?.categories;

  if (!Array.isArray(categories) || !categories.every((c) => CATEGORIES.includes(c))) {
    return NextResponse.json({ error: "Pick valid categories" }, { status: 400 });
  }

  await connectDB();
  const user = await User.findByIdAndUpdate(
    session.sub,
    { favouriteCategories: [...new Set(categories)] },
    { new: true }
  );
  if (!user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }
  return NextResponse.json({ categories: user.favouriteCategories });
}