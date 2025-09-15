import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Returns the app base URL for redirects in all environments
export function getAppBaseUrl() {
  // Prefer runtime origin when in browser (handles previews automatically)
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  // Fallbacks for SSR/build tools
  const explicit = import.meta?.env?.VITE_SITE_URL;
  if (explicit) return explicit;
  return "http://localhost:5173";
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // If less than an hour, show minutes
  if (diffInHours < 1) {
    if (diffInMinutes < 1) return "Created just now";
    return `Created ${diffInMinutes} ${
      diffInMinutes === 1 ? "minute" : "minutes"
    } ago`;
  }

  // If less than a day, show hours
  if (diffInDays < 1) {
    return `Created ${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  // If yesterday
  if (diffInDays === 1) {
    return "Created yesterday";
  }

  // If more than yesterday, show full date
  return `Created ${date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })}`;
}
