import FeedView from "@/components/FeedView";

export const metadata = { title: "My Feed | Events Board" };

export default function FeedPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">My Feed</h1>
      <p className="mt-1 mb-6 text-slate-500">Upcoming events from your favourite categories.</p>
      <FeedView />
    </div>
  );
}