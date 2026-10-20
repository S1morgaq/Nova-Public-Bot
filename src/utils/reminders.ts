import type { Client } from 'discord.js';
import { reminders } from '../db';

export function startReminderScheduler(client: Client): void {
  setInterval(async () => {
    const due = reminders.all().filter((r) => r.at <= Date.now());
    for (const r of due) {
      reminders.remove(r.id);
      const channel = await client.channels.fetch(r.channelId).catch(() => null);
      const text = `<@${r.userId}> ⏰ Hatırlatma: ${r.text}`;
      if (channel?.isTextBased() && 'send' in channel) {
        await channel.send({ content: text, allowedMentions: { users: [r.userId] } }).catch(() => null);
      } else {
        const user = await client.users.fetch(r.userId).catch(() => null);
        await user?.send(text).catch(() => null);
      }
    }
  }, 15_000);
}
