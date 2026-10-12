// Indian number format: 150000 -> "₹1,50,000". Zero is shown as "Free".
export function formatPrice(price) {
  if (price === 0) return "Free";
  return "₹" + new Intl.NumberFormat("en-IN").format(price);
}

// Friendly date: "Sun, 18 Oct, 6:30 PM". The India time zone is used,
// so the server and the browser print the same text.
export function formatDate(value) {
  const date = new Date(value);
  const day = date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  return `${day}, ${time.toUpperCase()}`;
}
