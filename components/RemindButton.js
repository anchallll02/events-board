"use client";

export default function RemindButton({ on, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        on
          ? "bg-indigo-600 text-white hover:bg-indigo-700"
          : "border border-indigo-600 text-indigo-600 hover:bg-indigo-50"
      }`}
    >
      {on ? "Reminder set ✓" : "Remind me"}
    </button>
  );
}