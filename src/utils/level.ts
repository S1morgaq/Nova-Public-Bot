export const xpNeeded = (level: number): number => 5 * level ** 2 + 50 * level + 100;

export function progressBar(value: number, max: number, size = 14): string {
  const filled = Math.max(0, Math.min(size, Math.round((value / max) * size)));
  return '▰'.repeat(filled) + '▱'.repeat(size - filled);
}
