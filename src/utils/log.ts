import type { EmbedBuilder, Guild } from 'discord.js';
import { getGuild, type LogType } from '../db';

/** Türe özel log kanalına, yoksa genel log kanalına gönderir. */
export async function sendLog(guild: Guild, embed: EmbedBuilder, type: LogType = 'mod'): Promise<void> {
  const s = getGuild(guild.id);
  const id = s.logs[type] ?? s.logChannel;
  if (!id) return;
  const channel = guild.channels.cache.get(id);
  if (!channel?.isTextBased()) return;
  await channel.send({ embeds: [embed.setTimestamp()] }).catch(() => null);
}
