/** Aynı girdiyle hep aynı diziyi üreten rastgele sayı üretici (günlük fal/şans gibi şeyler için). */
export function seeded(input: string): () => number {
  let h = 2166136261;
  for (const c of input) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const today = () => new Date().toISOString().slice(0, 10);
