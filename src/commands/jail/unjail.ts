import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';
import { releaseMember } from '../../utils/jail';

const command: Command = {
  category: 'Ceza',
  aliases: ['cezakaldir'],
  data: new SlashCommandBuilder()
    .setName('unjail')
    .setDescription('Üyeyi cezalıdan çıkarır ve eski rollerini geri verir.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('uye', true);
    const done = await releaseMember(i.guild!, user.id);
    if (!done) return i.reply({ embeds: [err('Bu üye cezalıda değil.')], ephemeral: true });
    return i.reply({ embeds: [ok(`${user} cezalıdan çıkarıldı.`)], allowedMentions: { parse: [] } });
  },
};

export default command;
