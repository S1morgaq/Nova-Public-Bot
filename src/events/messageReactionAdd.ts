import { EmbedBuilder, type MessageReaction, type PartialMessageReaction, type PartialUser, type TextBasedChannel, type User } from 'discord.js';
import { getGuild, stars } from '../db';
import type { BotEvent } from '../types';

const event: BotEvent = {
  name: 'messageReactionAdd',
  async execute(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    if (!reaction.client.modules.has('tools') || user.bot || reaction.emoji.name !== '⭐') return;
    const full = reaction.partial ? await reaction.fetch().catch(() => null) : reaction;
    const msg = full?.message.partial ? await full.message.fetch().catch(() => null) : full?.message;
    if (!full || !msg?.guild) return;

    const s = getGuild(msg.guild.id);
    if (!s.starChannel || msg.channelId === s.starChannel) return;
    if (full.count < s.starThreshold) return;

    const target = msg.guild.channels.cache.get(s.starChannel);
    if (!target?.isTextBased()) return;
    const content = `⭐ **${full.count}** • ${msg.channel}`;

    const existingId = stars.get(msg.id);
    if (existingId) {
      const existing = await (target as TextBasedChannel).messages.fetch(existingId).catch(() => null);
      await existing?.edit({ content }).catch(() => null);
      return;
    }

    const e = new EmbedBuilder()
      .setColor(0xfacc15)
      .setAuthor({ name: msg.author?.username ?? 'Bilinmiyor', iconURL: msg.author?.displayAvatarURL() })
      .setDescription(`${msg.content || '*(içerik yok)*'}\n\n[Mesaja git](${msg.url})`)
      .setTimestamp(msg.createdAt);
    const img = msg.attachments.find((a) => a.contentType?.startsWith('image/'));
    if (img) e.setImage(img.url);
    const sent = await target.send({ content, embeds: [e] }).catch(() => null);
    if (sent) stars.set(msg.id, sent.id);
  },
};

export default event;
