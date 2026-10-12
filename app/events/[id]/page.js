import { Suspense } from "react";
import EventDetail from "@/components/EventDetail";

export const metadata = { title: "Event | Events Board" };

async function EventContent({ params }) {
  const { id } = await params;
  return <EventDetail id={id} />;
}

export default function EventPage({ params }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-slate-200" />}>
        <EventContent params={params} />
      </Suspense>
    </div>
  );
}