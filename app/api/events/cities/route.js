import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";

// Cities that have at least one active, upcoming event (for the filter dropdown).
export async function GET() {
  await connectDB();
  const cities = await Event.distinct("city", {
    isActive: true,
    startsAt: { $gte: new Date() },
  });
  return NextResponse.json({ cities: cities.sort() });
}