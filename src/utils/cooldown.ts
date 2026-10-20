import { getUser, touch } from '../db';

/** Kalan bekleme süresini (ms) döner; 0 ise kullanılabilir. `commit` true ise süreyi başlatır. */
export function cooldown(guildId: string, userId: string, key: string, ms: number, commit = true): number {
  const u = getUser(guildId, userId);
  u.cooldowns ??= {};
  const left = (u.cooldowns[key] ?? 0) + ms - Date.now();
  if (left > 0) return left;
  if (commit) {
    u.cooldowns[key] = Date.now();
    touch();
  }
  return 0;
}

export const rand = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
export const pickOne = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
