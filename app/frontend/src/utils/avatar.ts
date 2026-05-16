export function getUserInitials(
  firstName?: string | null,
  lastName?: string | null
): string {
  const first = firstName?.trim() ?? '';
  const last = lastName?.trim() ?? '';
  if (first && last) return (first[0] + last[0]).toUpperCase();
  if (first) return first.substring(0, 2).toUpperCase();
  if (last) return last.substring(0, 2).toUpperCase();
  return 'U';
}
