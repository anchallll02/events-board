"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CardDesigner from "@/components/CardDesigner";
import RemindButton from "@/components/RemindButton";
import { ErrorBox } from "@/components/Skeletons";
import { useReminders } from "@/hooks/useReminders";
import { formatDate, formatPrice } from "@/lib/format";

export default function EventDetail({ id }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: "", status: "ok", event: null });
  const { ids, message, toggle } = useReminders();

  const currentKey = `${id}|${reloadKey}`;
  const loading = result.key !== currentKey;

  useEffect(() => {
    let cancelled = false;
    const key = `${id}|${reloadKey}`;

    fetch(`/api/events/${id}`)
      .then(async (res) => {
        if (res.status === 404) return { status: "notfound" };
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        return { status: "ok", event: data.event };
      })
      .catch(() => ({ status: "error" }))
      .then((outcome) => {
        if (!cancelled) setResult({ key, event: null, ...outcome });
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  if (loading) return <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />;

  if (result.status === "notfound") {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-800">This event is not available.</p>
        <Link href="/" className="mt-2 inline-block font-medium text-indigo-600 underline">
          Back to events
        </Link>
      </div>
    );
  }

  if (result.status === "error") {
    return (
      <ErrorBox
        message="Could not load this event. Please try again."
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  const event = result.event;

  return (
    <div>
      <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
        ← All events
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={event.imageUrl} alt={event.title} className="h-64 w-full object-cover sm:h-80" />

        <div className="p-5">
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {event.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{event.title}</h1>
          <p className="mt-1 text-slate-500">
            {event.city} · {formatDate(event.startsAt)}
          </p>
          <p className="mt-4 text-slate-700">{event.description}</p>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900">{formatPrice(event.price)}</span>
            <RemindButton on={ids.includes(event._id)} onClick={() => toggle(event._id)} />
          </div>

          {message && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </p>
          )}
        </div>
      </div>

      <CardDesigner event={event} />
    </div>
  );
}