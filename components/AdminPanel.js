"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";

const emptyForm = {
  title: "",
  category: "Music",
  city: "",
  startsAt: "",
  price: "",
  description: "",
  imageUrl: "",
};

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function AdminPanel() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [loadedKey, setLoadedKey] = useState(-1);
  const [loadFailed, setLoadFailed] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loading = loadedKey !== reloadKey;

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/events")
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          router.push("/admin/login");
          return;
        }
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        if (!cancelled) {
          setEvents(data.events);
          setLoadFailed(false);
          setLoadedKey(reloadKey);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
          setLoadedKey(reloadKey);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey, router]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setMessage("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // The date box gives local time without a time zone.
          // Converting it here makes the server store the exact moment.
          startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Could not save the event");
        return;
      }

      setForm(emptyForm);
      setMessage("Event added");
      setReloadKey((k) => k + 1);
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item) {
    setMessage("");
    try {
      const res = await fetch(`/api/admin/events/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error("Update failed");
      const data = await res.json();
      setEvents((list) => list.map((e) => (e._id === item._id ? data.event : e)));
    } catch {
      setMessage("Could not update the event. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin panel</h1>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add an event</h2>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Title
            <input
              required
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Category
            <select
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            City
            <input
              required
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Date and time
            <input
              type="datetime-local"
              required
              value={form.startsAt}
              onChange={(e) => updateField("startsAt", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            Price (₹)
            <input
              type="number"
              min="0"
              required
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Image URL
            <input
              type="url"
              required
              value={form.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-700 sm:col-span-2">
            Description
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="sm:col-span-2">
            {formError && (
              <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add event"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">All events</h2>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}

        {loading ? (
          <p className="mt-4 text-slate-500">Loading events...</p>
        ) : loadFailed ? (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Could not load events.{" "}
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="font-semibold underline"
            >
              Try again
            </button>
          </div>
        ) : events.length === 0 ? (
          <p className="mt-4 text-slate-500">No events yet. Add the first one above.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {events.map((item) => (
              <li
                key={item._id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{item.title}</p>
                  <p className="text-sm text-slate-500">
                    {item.category} · {item.city} · {formatDate(item.startsAt)} ·{" "}
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      item.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {item.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => toggleActive(item)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {item.isActive ? "Make inactive" : "Make active"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}