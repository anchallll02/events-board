import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/constants";
import { findUpcoming, readPage } from "@/lib/events";

// Public list: GET /api/events?category=Music&city=Coimbatore&q=night&page=1
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const category = searchParams.get("category");
  const categories = CATEGORIES.includes(category) ? [category] : [];
  const city = searchParams.get("city")?.trim() || "";
  const q = searchParams.get("q")?.trim().slice(0, 100) || "";

  const result = await findUpcoming({ categories, city, q, page: readPage(searchParams) });
  return NextResponse.json(result);
}