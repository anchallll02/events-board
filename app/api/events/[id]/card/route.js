import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { CardDesign } from "@/models/CardDesign";
import { requireRole } from "@/lib/auth";
import { THEMES, STICKERS, MAX_STICKERS } from "@/lib/constants";

// Saved card design of the logged-in user for this event.
export async function GET(request, { params }) {
  const { error, session } = await requireRole(request, "user");
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await connectDB();
  const design = await CardDesign.findOne({ userId: session.sub, eventId: id });
  return NextResponse.json({
    design: design ? { theme: design.theme, stickers: design.stickers } : null,
  });
}

// Create or replace the design (one design per user per event).
export async function PUT(request, { params }) {
  const { error, session } = await requireRole(request, "user");
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const theme = body?.theme;
  const stickers = body?.stickers;

  if (!THEMES.some((t) => t.id === theme)) {
    return NextResponse.json({ error: "Pick a valid theme" }, { status: 400 });
  }
  if (
    !Array.isArray(stickers) ||
    stickers.length > MAX_STICKERS ||
    !stickers.every((s) => STICKERS.includes(s))
  ) {
    return NextResponse.json(
      { error: `Choose up to ${MAX_STICKERS} stickers from the list` },
      { status: 400 }
    );
  }

  await connectDB();
  if (!(await Event.exists({ _id: id }))) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const design = await CardDesign.findOneAndUpdate(
    { userId: session.sub, eventId: id },
    { theme, stickers },
    { upsert: true, new: true, runValidators: true }
  );
  return NextResponse.json({ design: { theme: design.theme, stickers: design.stickers } });
}