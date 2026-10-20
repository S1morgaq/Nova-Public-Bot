import type { Client, Guild, GuildMember } from 'discord.js';
import { jails } from '../db';

export async function jailMember(member: GuildMember, jailRole: string, minutes: number, reason: string): Promise<void> {
  const keep = member.roles.cache.filter((r) => r.managed).map((r) => r.id);
  const saved = member.roles.cache.filter((r) => r.id !== member.guild.id && !r.managed && r.id !== jailRole).map((r) => r.id);
  const existing = jails.get(member.guild.id, member.id);
  jails.add({
    guildId: member.guild.id,
    userId: member.id,
    roles: existing?.roles ?? saved,
    until: minutes > 0 ? Date.now() + minutes * 60_000 : null,
    reason,
  });
  await member.roles.set([...keep, jailRole], reason);
  if (member.voice.channel) await member.voice.disconnect(reason).catch(() => null);
}

export async function releaseMember(guild: Guild, userId: string): Promise<boolean> {
  const j = jails.get(guild.id, userId);
  if (!j) return false;
  jails.remove(guild.id, userId);
  const member = await guild.members.fetch(userId).catch(() => null);
  if (member) {
    const keep = member.roles.cache.filter((r) => r.managed).map((r) => r.id);
    const restore = j.roles.filter((id) => guild.roles.cache.has(id));
    await member.roles.set([...keep, ...restore], 'Jail sona erdi').catch(() => null);
  }
  return true;
}

export function startJailScheduler(client: Client): void {
  setInterval(async () => {
    for (const j of jails.all().filter((x) => x.until && x.until <= Date.now())) {
      const guild = client.guilds.cache.get(j.guildId);
      if (guild) await releaseMember(guild, j.userId);
    }
  }, 30_000);
}
