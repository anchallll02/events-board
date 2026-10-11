import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event, CATEGORIES } from "@/models/Event";
import { requireRole } from "@/lib/auth";

function isValidUrl(text) {
  try {
    new URL(text);
    return true;
  } catch {
    return false;
  }
}

// Admin sees every event: active, inactive, upcoming and past.
export async function GET(request) {
  const { error } = await requireRole(request, "admin");
  if (error) return error;

  await connectDB();
  const events = await Event.find().sort({ startsAt: -1 });
  return NextResponse.json({ events });
}

export async function POST(request) {
  const { error } = await requireRole(request, "admin");
  if (error) return error;

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const title = body.title?.trim();
  const city = body.city?.trim();
  const description = body.description?.trim();
  const imageUrl = body.imageUrl?.trim();
  const startsAt = new Date(body.startsAt);
  const price = Number(body.price);

  if (!title  !city  !description || !imageUrl) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (!CATEGORIES.includes(body.category)) {
    return NextResponse.json({ error: "Pick a valid category" }, { status: 400 });
  }
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "Enter a valid date and time" }, { status: 400 });
  }
  if (body.price === ""  body.price == null  !Number.isFinite(price) || price < 0) {
    return NextResponse.json({ error: "Price must be 0 or more" }, { status: 400 });
  }
  if (!isValidUrl(imageUrl)) {
    return NextResponse.json({ error: "Image URL is not valid" }, { status: 400 });
  }

  await connectDB();
  const event = await Event.create({
    title,
    category: body.category,
    city,
    startsAt,
    price,
    description,
    imageUrl,
  });

  return NextResponse.json({ event }, { status: 201 });
}