import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';
import { sendLog } from '../../utils/log';
import { hierarchyError } from '../../utils/mod';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['kick'],
  data: new SlashCommandBuilder()
    .setName('at')
    .setDescription('Bir üyeyi sunucudan atar.')
    .addUserOption((o) => o.setName('kullanici').setDescription('Atılacak üye').setRequired(true))
    .addStringOption((o) => o.setName('sebep').setDescription('Sebep'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('kullanici', true);
    const reason = i.options.getString('sebep') ?? 'Sebep belirtilmedi';
    const member = await i.guild!.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
    const problem = hierarchyError(i, member);
    if (problem) return i.reply({ embeds: [err(problem)], ephemeral: true });
    await member.kick(`${i.user.tag}: ${reason}`);
    await i.reply({ embeds: [ok(`**${user.tag}** atıldı. Sebep: ${reason}`)] });
    await sendLog(i.guild!, new EmbedBuilder().setColor(Colors.warn).setTitle('👢 Atma').setDescription(`**Üye:** ${user.tag} (${user.id})\n**Yetkili:** ${i.user}\n**Sebep:** ${reason}`));
  },
};

export default command;
