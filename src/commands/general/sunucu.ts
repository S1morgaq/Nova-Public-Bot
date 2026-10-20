import { ChannelType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors } from '../../utils/embed';

const command: Command = {
  category: 'Genel',
  aliases: ['serverinfo', 'si'],
  data: new SlashCommandBuilder().setName('sunucu').setDescription('Sunucu bilgilerini gösterir.').setDMPermission(false),
  async execute(i) {
    const g = i.guild!;
    const ch = g.channels.cache;
    const e = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle(g.name)
      .setThumbnail(g.iconURL({ size: 256 }))
      .addFields(
        { name: 'Sahip', value: `<@${g.ownerId}>`, inline: true },
        { name: 'Üye', value: String(g.memberCount), inline: true },
        { name: 'Boost', value: `${g.premiumSubscriptionCount ?? 0} (Seviye ${g.premiumTier})`, inline: true },
        { name: 'Kanallar', value: `💬 ${ch.filter((c) => c.type === ChannelType.GuildText).size} • 🔊 ${ch.filter((c) => c.type === ChannelType.GuildVoice).size}`, inline: true },
        { name: 'Roller', value: String(g.roles.cache.size - 1), inline: true },
        { name: 'Kuruluş', value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`, inline: true },
      );
    return i.reply({ embeds: [e] });
  },
};

export default command;
