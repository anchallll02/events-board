import mongoose from "mongoose";
import { CATEGORIES } from "./Event.js";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    // Kept inside the user: the list is tiny and always read together with the user.
    favouriteCategories: [{ type: String, enum: CATEGORIES }],
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);