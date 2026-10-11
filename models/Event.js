import mongoose from "mongoose";

export const CATEGORIES = ["Music", "Workshop", "Food", "Sports", "Kids"];

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: CATEGORIES, required: true },
    city: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 }, // whole rupees
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Visitor query: isActive = true, optional category, optional city,
// startsAt >= now, sorted by startsAt. Equality fields come first and the
// range/sort field (startsAt) comes last.
eventSchema.index({ isActive: 1, category: 1, city: 1, startsAt: 1 });

export const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);