"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { THEMES, STICKERS, MAX_STICKERS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default function CardDesigner({ event }) {
  const router = useRouter();
  const [theme, setTheme] = useState(THEMES[0].id);
  const [stickers, setStickers] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Load the design this user saved earlier for this event.
  useEffect(() => {
    let cancelled = false;

    fetch(`/api/events/${event._id}/card`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setLoggedIn(true);
        if (data.design) {
          setTheme(data.design.theme);
          setStickers(data.design.stickers);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [event._id]);

  function addSticker(sticker) {
    if (stickers.length >= MAX_STICKERS) return;
    setMessage("");
    setStickers((list) => [...list, sticker]);
  }

  function removeSticker(index) {
    setMessage("");
    setStickers((list) => list.filter((_, i) => i !== index));
  }

  async function save() {
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/events/${event._id}/card`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme, stickers }),
      });
      setMessage(res.ok ? "Design saved!" : "Could not save your design. Please try again.");
    } catch {
      setMessage("Could not save your design. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900">Design your card</h2>
      <p className="mt-1 text-sm text-slate-500">
        Pick a theme and add up to {MAX_STICKERS} stickers.
      </p>

      <div className="mt-5 grid gap-6 md:grid-cols-2">
        {/* Live preview. All backgrounds are stacked and only the chosen one is visible,
            so changing the theme fades smoothly. */}
        <div className="relative min-h-56 overflow-hidden rounded-2xl text-white shadow-md">
          {THEMES.map((t) => (
            <div
              key={t.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                t.id === theme ? "opacity-100" : "opacity-0"
              }`}
              style={{ background: t.background }}
            />
          ))}

          <div className="relative flex h-full min-h-56 flex-col justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-80">
                You are invited
              </p>
              <h3 className="mt-1 text-2xl font-bold">{event.title}</h3>
              <p className="mt-1 text-sm opacity-90">
                {event.city} · {formatDate(event.startsAt)}
              </p>
            </div>

            <div className="mt-4 flex min-h-12 gap-2">
              {stickers.map((sticker, index) => (
                <button
                  key={`${sticker}-${index}`}
                  type="button"
                  onClick={() => removeSticker(index)}
                  aria-label={`Remove sticker ${sticker}`}
                  className="sticker-pop text-4xl transition-transform hover:scale-110"
                >
                  {sticker}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-700">Theme</p>
          <div className="mt-2 flex gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setMessage("");
                }}
                aria-pressed={t.id === theme}
                className={`flex-1 rounded-lg border-2 p-1 text-xs font-medium ${
                  t.id === theme ? "border-indigo-600" : "border-transparent"
                }`}
              >
                <span className="block h-10 rounded-md" style={{ background: t.background }} />
                <span className="mt-1 block text-slate-700">{t.name}</span>
              </button>
            ))}
          </div>

          <p className="mt-5 text-sm font-medium text-slate-700">
            Stickers ({stickers.length}/{MAX_STICKERS}) · tap a sticker on the card to remove it
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {STICKERS.map((sticker) => (
              <button
                key={sticker}
                type="button"
                onClick={() => addSticker(sticker)}
                disabled={stickers.length >= MAX_STICKERS}
                aria-label={`Add sticker ${sticker}`}
                className="rounded-lg border border-slate-300 px-3 py-2 text-2xl hover:bg-slate-100 disabled:opacity-40"
              >
                {sticker}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : loggedIn ? "Save design" : "Log in to save"}
            </button>
            {message && <span className="text-sm text-slate-600">{message}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}