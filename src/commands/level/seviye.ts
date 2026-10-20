import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getUser, topUsers } from '../../db';
import type { Command } from '../../types';
import { Colors } from '../../utils/embed';
import { progressBar, xpNeeded } from '../../utils/level';

const command: Command = {
  category: 'Seviye',
  aliases: ['rank', 'level'],
  data: new SlashCommandBuilder()
    .setName('seviye')
    .setDescription('Seviye kartını gösterir.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye'))
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('uye') ?? i.user;
    const d = getUser(i.guildId!, user.id);
    const need = xpNeeded(d.level);
    const rank = topUsers(i.guildId!, 10_000).findIndex((u) => u.userId === user.id) + 1;
    const e = new EmbedBuilder()
      .setColor(Colors.primary)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setDescription(`**Seviye ${d.level}** • Sıra #${rank || '—'}\n${progressBar(d.xp, need)} \`${d.xp}/${need} XP\`\n💬 ${d.messages} mesaj`);
    return i.reply({ embeds: [e] });
  },
};

export default command;
