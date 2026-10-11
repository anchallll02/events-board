import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  },
  { timestamps: true }
);

// One reminder per user per event. The database blocks duplicates.
reminderSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Reminder =
  mongoose.models.Reminder || mongoose.model("Reminder", reminderSchema);