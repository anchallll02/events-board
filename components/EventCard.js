import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import RemindButton from "@/components/RemindButton";

export default function EventCard({ event, reminded, onRemind }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Link href={`/events/${event._id}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.imageUrl}
          alt={event.title}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <span className="w-fit rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {event.category}
        </span>
        <Link href={`/events/${event._id}`}>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 hover:text-indigo-600">
            {event.title}
          </h3>
        </Link>
        <p className="mt-1 text-sm text-slate-500">
          {event.city} · {formatDate(event.startsAt)}
        </p>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-semibold text-slate-900">{formatPrice(event.price)}</span>
          <RemindButton on={reminded} onClick={onRemind} />
        </div>
      </div>
    </article>
  );
}
