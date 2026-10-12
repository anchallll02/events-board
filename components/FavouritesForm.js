"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/constants";
import { ErrorBox } from "@/components/Skeletons";

export default function FavouritesForm() {
  const [status, setStatus] = useState("loading"); // loading | ready | login | error
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/favourites")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) return { status: "login" };
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        return { status: "ready", categories: data.categories };
      })
      .catch(() => ({ status: "error" }))
      .then((outcome) => {
        if (cancelled) return;
        setStatus(outcome.status);
        if (outcome.categories) setSelected(outcome.categories);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(category) {
    setMessage("");
    setSelected((list) =>
      list.includes(category) ? list.filter((c) => c !== category) : [...list, category]
    );
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/favourites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories: selected }),
      });
      setMessage(res.ok ? "Saved!" : "Could not save. Please try again.");
    } catch {
      setMessage("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (status === "loading") return <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />;

  if (status === "login") {
    return (
      <p className="text-slate-600">
        Please{" "}
        <Link href="/login" className="font-medium text-indigo-600 underline">
          log in
        </Link>{" "}
        to pick your favourite categories.
      </p>
    );
  }

  if (status === "error") return <ErrorBox message="Could not load your categories." />;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((category) => {
          const on = selected.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggle(category)}
              aria-pressed={on}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                on
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {message && <span className="text-sm text-slate-600">{message}</span>}
        <Link href="/feed" className="text-sm font-medium text-indigo-600 underline">
          Go to My Feed
        </Link>
      </div>
    </div>
  );
}