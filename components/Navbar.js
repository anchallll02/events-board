"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setChecked(true));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  const linkClass = "font-medium text-slate-700 hover:text-indigo-600";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-indigo-600">
          Events Board
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/" className={linkClass}>
            Events
          </Link>
          <Link href="/feed" className={linkClass}>
            My Feed
          </Link>

          {user?.role === "user" && (
            <Link href="/favourites" className={linkClass}>
              Favourites
            </Link>
          )}
          {user?.role === "admin" && (
            <Link href="/admin" className={linkClass}>
              Admin
            </Link>
          )}

          {!checked ? null : user ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className={linkClass}>
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-indigo-600 px-3 py-1.5 font-medium text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}