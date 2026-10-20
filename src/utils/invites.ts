import type { Guild } from 'discord.js';

/** guildId → (davet kodu → kullanım sayısı). Üye girince hangi davetin arttığına bakılır. */
const cache = new Map<string, Map<string, number>>();

export async function refreshInvites(guild: Guild): Promise<void> {
  const invites = await guild.invites.fetch().catch(() => null);
  if (invites) cache.set(guild.id, new Map(invites.map((i) => [i.code, i.uses ?? 0])));
}

/** Son girişte kullanımı artan daveti bulur (Davetleri Yönet/Sunucuyu Yönet yetkisi gerekir). */
export async function findUsedInvite(guild: Guild): Promise<{ code: string; inviterId: string | null } | null> {
  const before = cache.get(guild.id);
  const invites = await guild.invites.fetch().catch(() => null);
  if (!invites) return null;
  const used = invites.find((i) => (i.uses ?? 0) > (before?.get(i.code) ?? 0));
  cache.set(guild.id, new Map(invites.map((i) => [i.code, i.uses ?? 0])));
  return used ? { code: used.code, inviterId: used.inviterId ?? null } : null;
}
