export const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-teal-500",
  "bg-rose-500",
  "bg-emerald-500",
];

/**
 * Extract initials from a name (max 2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(-2)
    .toUpperCase();
}

/**
 * Deterministically get an avatar color based on the employee ID
 */
export function getAvatarColor(id: string | number): string {
  if (!id) return AVATAR_COLORS[0];
  const idStr = String(id);
  const index = parseInt(idStr.replace(/\D/g, ""), 10) || 0;
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}
