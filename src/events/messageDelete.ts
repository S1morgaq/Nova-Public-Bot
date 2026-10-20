import { EmbedBuilder, type Message, type PartialMessage } from 'discord.js';
import type { BotEvent } from '../types';
import { Colors } from '../utils/embed';
import { sendLog } from '../utils/log';
import { deleted, edited, ignoreSnipe, record } from '../utils/snipe';

const events: BotEvent[] = [
  {
    name: 'messageDelete',
    async execute(msg: Message | PartialMessage) {
      if (!msg.guild || msg.author?.bot) return;
      const image = msg.attachments?.first()?.url;
      if (!msg.content && !image) return; // önbellekte olmayan (partial) mesaj ya da boş

      if (ignoreSnipe.delete(msg.id)) return; // AutoMod'un sildiği mesaj
      if (msg.client.modules.has('tools')) {
        record(deleted, msg.channelId, {
          content: (msg.content ?? '').slice(0, 1500),
          authorTag: msg.author?.tag ?? 'Bilinmiyor',
          authorAvatar: msg.author?.displayAvatarURL() ?? '',
          image,
          at: Date.now(),
        });
      }
      if (!msg.client.modules.has('logs') || !msg.content) return;
      await sendLog(
        msg.guild,
        new EmbedBuilder()
          .setColor(Colors.error)
          .setTitle('🗑️ Mesaj Silindi')
          .setDescription(`${msg.author ?? 'Bilinmiyor'} • ${msg.channel}\n\`\`\`${msg.content.slice(0, 1000)}\`\`\``),
        'message',
      );
    },
  },
  {
    // Düzenlenen mesajları /snipe tur:duzenlenen için sakla
    name: 'messageUpdate',
    async execute(oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) {
      if (!newMsg.client.modules.has('tools') || !newMsg.guild || newMsg.author?.bot) return;
      if (!oldMsg.content || !newMsg.content || oldMsg.content === newMsg.content) return;
      record(edited, newMsg.channelId, {
        content: newMsg.content.slice(0, 1500),
        before: oldMsg.content.slice(0, 1500),
        authorTag: newMsg.author?.tag ?? 'Bilinmiyor',
        authorAvatar: newMsg.author?.displayAvatarURL() ?? '',
        at: Date.now(),
      });
    },
  },
];

export default events;
