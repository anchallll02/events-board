import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { requireRole } from "@/lib/auth";

// Make an event Active or Inactive. Events are never deleted.
export async function PATCH(request, { params }) {
  const { error } = await requireRole(request, "admin");
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.isActive !== "boolean") {
    return NextResponse.json(
      { error: "isActive must be true or false" },
      { status: 400 }
    );
  }

  await connectDB();
  const event = await Event.findByIdAndUpdate(
    id,
    { isActive: body.isActive },
    { new: true }
  );

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ event });
}