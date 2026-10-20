export interface Sniped {
  content: string;
  authorTag: string;
  authorAvatar: string;
  image?: string;
  at: number;
  /** Düzenlenen mesajlarda eski içerik */
  before?: string;
}

const MAX = 10;

/** Kanal başına son silinen / düzenlenen mesajlar (en yeni başta, bellekte tutulur). */
export const deleted = new Map<string, Sniped[]>();
export const edited = new Map<string, Sniped[]>();

/** AutoMod gibi bot kaynaklı silmeler snipe'a düşmesin (filtrelenen içerik sızmasın). */
export const ignoreSnipe = new Set<string>();

export function record(map: Map<string, Sniped[]>, channelId: string, entry: Sniped): void {
  const list = map.get(channelId) ?? [];
  list.unshift(entry);
  map.set(channelId, list.slice(0, MAX));
}
