import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
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
        return `Created ${diffInHours} ${
            diffInHours === 1 ? "hour" : "hours"
        } ago`;
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
