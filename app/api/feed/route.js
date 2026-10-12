import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { requireRole } from "@/lib/auth";
import { findUpcoming, readPage } from "@/lib/events";

// My Feed: upcoming events from the user's favourite categories only.
export async function GET(request) {
  const { error, session } = await requireRole(request, "user");
  if (error) return error;

  await connectDB();
  const user = await User.findById(session.sub);
  if (!user) {
    return NextResponse.json({ error: "Please log in" }, { status: 401 });
  }

  const favourites = user.favouriteCategories;
  if (favourites.length === 0) {
    return NextResponse.json({ events: [], total: 0, page: 1, pages: 1, favourites });
  }

  const { searchParams } = new URL(request.url);
  const result = await findUpcoming({
    categories: favourites,
    page: readPage(searchParams),
  });
  return NextResponse.json({ ...result, favourites });
}