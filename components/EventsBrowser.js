"use client";

import { useEffect, useState } from "react";
import EventGrid from "@/components/EventGrid";
import { GridSkeleton, ErrorBox, EmptyBox, Pager } from "@/components/Skeletons";
import { CATEGORIES } from "@/lib/constants";

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200";

export default function EventsBrowser() {
  const [category, setCategory] = useState("");
  const [city, setCity] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [cities, setCities] = useState([]);
  const [result, setResult] = useState({ key: "", events: [], pages: 1, failed: false });

  // Build the query string from the filters.
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (city) params.set("city", city);
  if (q) params.set("q", q);
  params.set("page", String(page));
  const query = params.toString();
  const currentKey = `${query}|${reloadKey}`;
  const loading = result.key !== currentKey;

  useEffect(() => {
    fetch("/api/events/cities")
      .then((res) => res.json())
      .then((data) => setCities(data.cities))
      .catch(() => {});
  }, []);

  // Wait 300 ms after the user stops typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const key = `${query}|${reloadKey}`;

    fetch(`/api/events?${query}`)
      .then((res) => {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setResult({ key, events: data.events, pages: data.pages, failed: false });
      })
      .catch(() => {
        if (!cancelled) setResult({ key, events: [], pages: 1, failed: true });
      });

    return () => {
      cancelled = true;
    };
  }, [query, reloadKey]);

  const hasFilters = category || city || searchInput;

  function clearFilters() {
    setCategory("");
    setCity("");
    setSearchInput("");
    setQ("");
    setPage(1);
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search events..."
          aria-label="Search events"
          className={selectClass}
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Category"
          className={selectClass}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
          aria-label="City"
          className={selectClass}
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {loading ? (
          <GridSkeleton />
        ) : result.failed ? (
          <ErrorBox
            message="Could not load events. Please check your connection."
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        ) : result.events.length === 0 ? (
          <EmptyBox title="No events found">
            {hasFilters ? (
              <button onClick={clearFilters} className="font-medium text-indigo-600 underline">
                Clear filters
              </button>
            ) : (
              "New events will show up here soon."
            )}
          </EmptyBox>
        ) : (
          <>
            <EventGrid events={result.events} />
            <Pager page={page} pages={result.pages} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}