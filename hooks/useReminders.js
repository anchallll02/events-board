"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Keeps the list of reminded event ids and handles the "Remind me" button.
export function useReminders() {
  const router = useRouter();
  const [ids, setIds] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/reminders")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setIds(data.eventIds);
        setLoggedIn(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  async function toggle(eventId) {
    if (!loggedIn) {
      router.push("/login");
      return;
    }

    const wasOn = ids.includes(eventId);
    setMessage("");

    // 1) change the screen immediately
    setIds((list) => (wasOn ? list.filter((x) => x !== eventId) : [...list, eventId]));

    // 2) save in the background
    try {
      const res = await fetch(`/api/reminders/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remind: !wasOn }),
      });
      if (!res.ok) throw new Error("Save failed");
    } catch {
      // 3) saving failed: go back to the old state and tell the user
      setIds((list) =>
        wasOn ? [...list.filter((x) => x !== eventId), eventId] : list.filter((x) => x !== eventId)
      );
      setMessage("Could not save your reminder. Please try again.");
    }
  }

  return { ids, message, toggle };
}