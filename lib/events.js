import { connectDB } from "@/lib/mongodb";
import { Event } from "@/models/Event";

// Makes user text safe to use inside a regular expression.
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function readPage(searchParams) {
  const page = parseInt(searchParams.get("page"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

// One query used by both the events page and My Feed.
// Only active events that have not started yet, nearest date first.
// Category, city and search are optional and combine with AND.
export async function findUpcoming({ categories = [], city = "", q = "", page = 1, limit = 6 }) {
  await connectDB();

  const filter = { isActive: true, startsAt: { $gte: new Date() } };

  if (categories.length > 0) filter.category = { $in: categories };
  if (city) filter.city = city;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: pattern }, { description: pattern }];
  }

  const total = await Event.countDocuments(filter);
  const pages = Math.max(1, Math.ceil(total / limit));
  const events = await Event.find(filter)
    .sort({ startsAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return { events, total, page, pages };
}