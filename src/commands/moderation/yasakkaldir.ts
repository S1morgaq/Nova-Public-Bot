import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['unban'],
  data: new SlashCommandBuilder()
    .setName('yasakkaldir')
    .setDescription('Kullanıcının yasağını kaldırır.')
    .addStringOption((o) => o.setName('id').setDescription('Kullanıcı ID\'si').setRequired(true).setMaxLength(20))
    .addStringOption((o) => o.setName('sebep').setDescription('Sebep'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false),
  async execute(i) {
    const id = i.options.getString('id', true).replace(/\D/g, '');
    const ban = await i.guild!.bans.fetch(id).catch(() => null);
    if (!ban) return i.reply({ embeds: [err('Bu ID\'ye ait bir yasak bulunamadı.')], ephemeral: true });
    await i.guild!.members.unban(id, `${i.user.tag}: ${i.options.getString('sebep') ?? 'Sebep belirtilmedi'}`);
    return i.reply({ embeds: [ok(`**${ban.user.tag}** yasağı kaldırıldı.`)] });
  },
};

export default command;
