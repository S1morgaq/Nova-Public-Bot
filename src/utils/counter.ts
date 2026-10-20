import type { Client } from 'discord.js';
import { getGuild } from '../db';

/** Üye sayacı ses kanalının adını 10 dakikada bir günceller (Discord kanal adı limiti: 10 dk'da 2 değişiklik). */
export function startCounterScheduler(client: Client): void {
  const update = async () => {
    for (const guild of client.guilds.cache.values()) {
      const id = getGuild(guild.id).counterChannel;
      const channel = id ? guild.channels.cache.get(id) : null;
      const name = `👥 Üye: ${guild.memberCount}`;
      if (channel && channel.name !== name) await channel.setName(name, 'Üye sayacı').catch(() => null);
    }
  };
  setTimeout(update, 10_000);
  setInterval(update, 10 * 60_000);
}
