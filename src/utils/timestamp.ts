/** Normalize transcript timestamps to MM:SS for consistent citation matching */
export function normalizeTimestamp(timestamp: string): string {
  const trimmed = timestamp.trim();
  const parts = trimmed.split(':').map((p) => p.trim());

  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(parts[1], 10);
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return trimmed;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);
    if (Number.isNaN(hours) || Number.isNaN(minutes) || Number.isNaN(seconds)) {
      return trimmed;
    }
    const totalMinutes = hours * 60 + minutes;
    return `${String(totalMinutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return trimmed;
}
