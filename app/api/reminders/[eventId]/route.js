import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";
import { Reminder } from "@/models/Reminder";
import { requireRole } from "@/lib/auth";

// PUT { "remind": true }  -> save a reminder
// PUT { "remind": false } -> remove it
export async function PUT(request, { params }) {
  const { error, session } = await requireRole(request, "user");
  if (error) return error;

  const { eventId } = await params;
  if (!mongoose.isValidObjectId(eventId)) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (typeof body?.remind !== "boolean") {
    return NextResponse.json({ error: "remind must be true or false" }, { status: 400 });
  }

  await connectDB();
  const key = { userId: session.sub, eventId };

  if (body.remind) {
    if (!(await Event.exists({ _id: eventId }))) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    // upsert: pressing twice never creates a duplicate
    await Reminder.updateOne(key, { $setOnInsert: key }, { upsert: true });
  } else {
    await Reminder.deleteOne(key);
  }

  return NextResponse.json({ remind: body.remind });
}