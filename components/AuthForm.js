"use client";

import Link from "next/link";
import { useState } from "react";

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(isSignup ? "/api/auth/signup" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Full reload so the navbar picks up the new login cookie.
      window.location.assign(isSignup ? "/favourites" : "/");
    } catch {
      setError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-bold text-slate-900">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isSignup
            ? "Sign up to save favourites and get reminders."
            : "Log in to see your feed and reminders."}
        </p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="mt-5 block text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm text-slate-500">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-medium text-indigo-600 hover:underline"
          >
            {isSignup ? "Log in" : "Create an account"}
          </Link>
        </p>
      </form>
    </div>
  );
}