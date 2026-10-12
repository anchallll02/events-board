"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EventGrid from "@/components/EventGrid";
import { GridSkeleton, ErrorBox, EmptyBox, Pager } from "@/components/Skeletons";

export default function FeedView() {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({
    key: "",
    status: "ok",
    events: [],
    pages: 1,
    favourites: [],
  });

  const currentKey = `${page}|${reloadKey}`;
  const loading = result.key !== currentKey;

  useEffect(() => {
    let cancelled = false;
    const key = `${page}|${reloadKey}`;

    fetch(`/api/feed?page=${page}`)
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) return { status: "login" };
        if (!res.ok) throw new Error("Request failed");
        const data = await res.json();
        return { status: "ok", events: data.events, pages: data.pages, favourites: data.favourites };
      })
      .catch(() => ({ status: "error" }))
      .then((outcome) => {
        if (!cancelled) {
          setResult({ key, events: [], pages: 1, favourites: [], ...outcome });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  if (loading) return <GridSkeleton />;

  if (result.status === "login") {
    return (
      <EmptyBox title="Log in to see your feed">
        <Link href="/login" className="font-medium text-indigo-600 underline">
          Go to login
        </Link>
      </EmptyBox>
    );
  }

  if (result.status === "error") {
    return (
      <ErrorBox
        message="Could not load your feed. Please try again."
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  if (result.favourites.length === 0) {
    return (
      <EmptyBox title="Your feed is empty">
        Pick your favourite categories first.{" "}
        <Link href="/favourites" className="font-medium text-indigo-600 underline">
          Choose categories
        </Link>
      </EmptyBox>
    );
  }

  if (result.events.length === 0) {
    return (
      <EmptyBox title="No upcoming events in your categories yet">
        We will show them here as soon as they are added.
      </EmptyBox>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-slate-500">
        Showing: {result.favourites.join(", ")}
      </p>
      <EventGrid events={result.events} />
      <Pager page={page} pages={result.pages} onChange={setPage} />
    </>
  );
}
