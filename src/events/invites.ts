import type { Guild, GuildMember, Invite } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { getGuild } from '../db';
import type { BotEvent } from '../types';
import { Colors } from '../utils/embed';
import { refreshInvites } from '../utils/invites';

const events: BotEvent[] = [
  {
    name: 'inviteCreate',
    async execute(invite: Invite) {
      if (invite.client.modules.has('welcome') && invite.guild && 'invites' in invite.guild) await refreshInvites(invite.guild as Guild);
    },
  },
  {
    name: 'inviteDelete',
    async execute(invite: Invite) {
      if (invite.client.modules.has('welcome') && invite.guild && 'invites' in invite.guild) await refreshInvites(invite.guild as Guild);
    },
  },
  {
    name: 'guildCreate',
    async execute(guild: Guild) {
      if (guild.client.modules.has('welcome')) await refreshInvites(guild);
    },
  },
  {
    // Sunucuya boost basılınca karşılama kanalında duyur
    name: 'guildMemberUpdate',
    async execute(oldM: GuildMember, newM: GuildMember) {
      if (!newM.client.modules.has('welcome') || oldM.premiumSince || !newM.premiumSince) return;
      const id = getGuild(newM.guild.id).welcomeChannel;
      const ch = id ? newM.guild.channels.cache.get(id) : null;
      if (!ch?.isTextBased()) return;
      await ch
        .send({ embeds: [new EmbedBuilder().setColor(0xf47fff).setTitle('🚀 Sunucuya Boost!').setDescription(`${newM} sunucuyu boostladı, teşekkürler! 💜\nToplam boost: **${newM.guild.premiumSubscriptionCount ?? 0}**`).setThumbnail(newM.displayAvatarURL())] })
        .catch(() => null);
    },
  },
];

export default events;
