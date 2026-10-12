"use client";

import EventCard from "@/components/EventCard";
import { useReminders } from "@/hooks/useReminders";

export default function EventGrid({ events }) {
  const { ids, message, toggle } = useReminders();

  return (
    <>
      {message && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            reminded={ids.includes(event._id)}
            onRemind={() => toggle(event._id)}
          />
        ))}
      </div>
    </>
  );
}