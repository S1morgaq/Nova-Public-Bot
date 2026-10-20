import { EmbedBuilder, type Client } from 'discord.js';
import { giveaways, type Giveaway } from '../db';
import { Colors } from './embed';

export function giveawayEmbed(g: Giveaway, ended = false, winners: string[] = []): EmbedBuilder {
  const e = new EmbedBuilder()
    .setColor(ended ? Colors.dark : Colors.primary)
    .setTitle(`🎉 ${g.prize}`)
    .setFooter({ text: `${g.winners} kazanan • ${g.participants.length} katılımcı` });
  if (ended) {
    e.setDescription(winners.length ? `**Kazananlar:** ${winners.map((w) => `<@${w}>`).join(', ')}` : 'Yeterli katılım olmadı.');
  } else {
    e.setDescription(
      `Katılmak için aşağıdaki butona tıkla!\n\n**Bitiş:** <t:${Math.floor(g.endsAt / 1000)}:R>\n**Düzenleyen:** <@${g.hostId}>`,
    );
  }
  return e;
}

export async function endGiveaway(client: Client, g: Giveaway): Promise<void> {
  if (g.ended) return;
  g.ended = true;
  giveaways.save();
  const pool = [...g.participants];
  const winners: string[] = [];
  while (pool.length && winners.length < g.winners) {
    winners.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  const channel = await client.channels.fetch(g.channelId).catch(() => null);
  if (!channel?.isTextBased() || channel.isDMBased()) return;
  const msg = await channel.messages.fetch(g.messageId).catch(() => null);
  await msg?.edit({ embeds: [giveawayEmbed(g, true, winners)], components: [] }).catch(() => null);
  await channel
    .send(winners.length ? `🎊 Tebrikler ${winners.map((w) => `<@${w}>`).join(', ')}! **${g.prize}** kazandınız!` : `😢 **${g.prize}** çekilişine kimse katılmadı.`)
    .catch(() => null);
}

export function startGiveawayScheduler(client: Client): void {
  setInterval(() => {
    for (const g of giveaways.all()) {
      if (!g.ended && g.endsAt <= Date.now()) void endGiveaway(client, g);
    }
  }, 15_000);
}
