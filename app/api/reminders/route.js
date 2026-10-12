import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Reminder } from "@/models/Reminder";
import { requireRole } from "@/lib/auth";

// Ids of the events this user has set a reminder for.
export async function GET(request) {
  const { error, session } = await requireRole(request, "user");
  if (error) return error;

  await connectDB();
  const reminders = await Reminder.find({ userId: session.sub });
  return NextResponse.json({ eventIds: reminders.map((r) => r.eventId.toString()) });
}