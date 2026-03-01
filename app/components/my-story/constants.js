export const STORAGE_KEYS = {
  CLASSES: "mml-story-classes",
  ENTRIES: "mml-story-entries",
};

/** Returns today's date as "YYYY-MM-DD" in local timezone */
export function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Format a "YYYY-MM-DD" string for display */
export function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

/** Check if a date string is today */
export function isToday(dateStr) {
  return dateStr === todayKey();
}

/** Preset color palette for classes */
export const CLASS_COLORS = [
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#22c55e", // green
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#a855f7", // purple
];

export const MAX_SENTENCE_LENGTH = 140;
export const MAX_PHOTOS = 3;
