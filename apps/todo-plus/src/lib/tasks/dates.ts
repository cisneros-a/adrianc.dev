// Deadlines are calendar dates ("YYYY-MM-DD") in the user's local time,
// so "due today" means today where the user is, not in UTC.

/** Today's date as "YYYY-MM-DD" in local time. */
export function todayKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function isOverdue(deadline: string, today: string): boolean {
  return deadline < today; // "YYYY-MM-DD" compares correctly as text
}

/** "Today", "Tomorrow", "Yesterday", or a short date like "Nov 3" (with the year if it isn't this year). */
export function formatDeadline(deadline: string, today: string): string {
  const days = daysBetween(today, deadline);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";

  const date = parseKey(deadline);
  const sameYear = deadline.slice(0, 4) === today.slice(0, 4);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function parseKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function daysBetween(from: string, to: string): number {
  const ms = parseKey(to).getTime() - parseKey(from).getTime();
  return Math.round(ms / 86_400_000);
}
