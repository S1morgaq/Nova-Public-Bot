import type { Client } from 'discord.js';
import { backups, getGuild } from '../db';
import { snapshot } from '../commands/guard/yedek';

/** Guard açık sunucuların rol/kanal yapısını günde bir kez otomatik yedekler. */
export function startAutoBackup(client: Client): void {
  const run = () => {
    for (const guild of client.guilds.cache.values()) {
      if (!getGuild(guild.id).guard.enabled) continue;
      try {
        backups.set(guild.id, snapshot(guild));
      } catch (e) {
        console.error('[autobackup]', guild.name, e);
      }
    }
  };
  setTimeout(run, 60_000);
  setInterval(run, 24 * 3600_000);
}
