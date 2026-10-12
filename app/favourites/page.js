import FavouritesForm from "@/components/FavouritesForm";

export const metadata = { title: "Favourites | Events Board" };

export default function FavouritesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900">Your favourite categories</h1>
      <p className="mt-1 mb-6 text-slate-500">
        We use these to build your My Feed.
      </p>
      <FavouritesForm />
    </div>
  );
}