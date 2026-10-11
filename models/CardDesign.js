import mongoose from "mongoose";

const cardDesignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    theme: { type: String, required: true },
    stickers: {
      type: [String],
      default: [],
      validate: {
        validator: (list) => list.length <= 3,
        message: "A card can have at most 3 stickers",
      },
    },
  },
  { timestamps: true }
);

// One saved design per user per event.
cardDesignSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const CardDesign =
  mongoose.models.CardDesign || mongoose.model("CardDesign", cardDesignSchema);