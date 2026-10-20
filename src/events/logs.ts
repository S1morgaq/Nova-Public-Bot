import { EmbedBuilder, type GuildMember, type Message, type PartialGuildMember, type PartialMessage, type VoiceState } from 'discord.js';
import type { BotEvent } from '../types';
import { Colors } from '../utils/embed';
import { sendLog } from '../utils/log';

const events: BotEvent[] = [
  {
    name: 'messageUpdate',
    async execute(oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) {
      if (!newMsg.client.modules.has('logs') || !newMsg.guild || newMsg.author?.bot) return;
      if (!oldMsg.content || !newMsg.content || oldMsg.content === newMsg.content) return;
      await sendLog(
        newMsg.guild,
        new EmbedBuilder()
          .setColor(Colors.warn)
          .setTitle('✏️ Mesaj Düzenlendi')
          .setDescription(`${newMsg.author} • ${newMsg.channel} • [Mesaja git](${newMsg.url})`)
          .addFields({ name: 'Önce', value: oldMsg.content.slice(0, 1000) }, { name: 'Sonra', value: newMsg.content.slice(0, 1000) }),
        'message',
      );
    },
  },
  {
    name: 'voiceStateUpdate',
    async execute(oldState: VoiceState, newState: VoiceState) {
      if (!newState.client.modules.has('logs') || oldState.channelId === newState.channelId) return;
      const member = newState.member ?? oldState.member;
      if (!member || member.user.bot) return;
      const text = !oldState.channelId ? `🔊 ${member} **${newState.channel}** kanalına girdi.` : !newState.channelId ? `🔇 ${member} **${oldState.channel}** kanalından çıktı.` : `🔀 ${member} **${oldState.channel}** → **${newState.channel}**`;
      await sendLog(newState.guild, new EmbedBuilder().setColor(Colors.primary).setDescription(text), 'voice');
    },
  },
  {
    name: 'guildMemberUpdate',
    async execute(oldM: GuildMember | PartialGuildMember, newM: GuildMember) {
      if (!newM.client.modules.has('logs') || newM.user.bot) return;
      const lines: string[] = [];
      if (oldM.nickname !== newM.nickname) lines.push(`**Takma ad:** ${oldM.nickname ?? '—'} → ${newM.nickname ?? '—'}`);
      const added = newM.roles.cache.filter((r) => !oldM.roles?.cache.has(r.id));
      const removed = oldM.roles?.cache.filter((r) => !newM.roles.cache.has(r.id));
      if (added.size) lines.push(`**Rol eklendi:** ${added.map((r) => r.name).join(', ')}`);
      if (removed?.size) lines.push(`**Rol alındı:** ${removed.map((r) => r.name).join(', ')}`);
      if (!lines.length) return;
      await sendLog(newM.guild, new EmbedBuilder().setColor(Colors.primary).setTitle('👤 Üye Güncellendi').setDescription(`${newM}\n${lines.join('\n')}`), 'member');
    },
  },
];

export default events;
