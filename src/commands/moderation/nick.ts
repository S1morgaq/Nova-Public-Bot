import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';
import { hierarchyError } from '../../utils/mod';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['takmaad', 'nickname'],
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Üyenin takma adını değiştirir (adı boş bırakırsan sıfırlar).')
    .addUserOption((o) => o.setName('uye').setDescription('Üye').setRequired(true))
    .addStringOption((o) => o.setName('ad').setDescription('Yeni takma ad').setMaxLength(32))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
    .setDMPermission(false),
  async execute(i) {
    const member = await i.guild!.members.fetch(i.options.getUser('uye', true).id).catch(() => null);
    if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
    const problem = member.id === i.user.id ? null : hierarchyError(i, member);
    if (problem) return i.reply({ embeds: [err(problem)], ephemeral: true });
    const name = i.options.getString('ad');
    await member.setNickname(name, i.user.tag);
    return i.reply({ embeds: [ok(name ? `${member} takma adı **${name}** yapıldı.` : `${member} takma adı sıfırlandı.`)], allowedMentions: { parse: [] } });
  },
};

export default command;
