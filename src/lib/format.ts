/**
 * Shared date/time formatting utilities used across the dashboard.
 */

/**
 * Format an ISO timestamp into a human-readable string.
 *
 * Example output: "Jun 20, 02:30 PM"
 */
export function formatTimestamp(isoString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString));
}

/**
 * Return a human-readable relative time string for the given ISO timestamp.
 *
 * Examples: "12s ago", "5m ago", "3h ago", "2d ago"
 * Falls back to `formatTimestamp` for dates older than 30 days.
 */
export function timeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = now - then;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatTimestamp(isoString);
}
