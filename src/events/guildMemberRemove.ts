import { EmbedBuilder, type GuildMember, type PartialGuildMember } from 'discord.js';
import { getGuild, getUser, touch } from '../db';
import type { BotEvent } from '../types';
import { Colors } from '../utils/embed';
import { sendLog } from '../utils/log';

const event: BotEvent = {
  name: 'guildMemberRemove',
  async execute(member: GuildMember | PartialGuildMember) {
    const mods = member.client.modules;
    const s = getGuild(member.guild.id);
    const name = member.user.tag;
    if (mods.has('welcome')) {
      const inviter = getUser(member.guild.id, member.id).invitedBy;
      if (inviter) {
        const inv = getUser(member.guild.id, inviter);
        inv.invitesLeft = (inv.invitesLeft ?? 0) + 1;
        touch();
      }
    }
    if (mods.has('welcome') && s.goodbyeChannel) {
      const ch = member.guild.channels.cache.get(s.goodbyeChannel);
      if (ch?.isTextBased()) {
        await ch.send({ embeds: [new EmbedBuilder().setColor(Colors.error).setDescription(`👋 **${name}** aramızdan ayrıldı.`)] }).catch(() => null);
      }
    }
    if (mods.has('logs')) {
      await sendLog(member.guild, new EmbedBuilder().setColor(Colors.error).setTitle('📤 Üye Ayrıldı').setDescription(`${member.user} (${name})`), 'member');
    }
  },
};

export default event;
