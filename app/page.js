import EventsBrowser from "@/components/EventsBrowser";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Upcoming events</h1>
      <p className="mt-1 mb-6 text-slate-500">Find something fun happening near you.</p>
      <EventsBrowser />
    </div>
  );
}