import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { clearWarns, getWarns } from '../../db';
import type { Command } from '../../types';
import { info, ok } from '../../utils/embed';

const command: Command = {
  category: 'Moderasyon',
  aliases: ['warnings'],
  data: new SlashCommandBuilder()
    .setName('uyarilar')
    .setDescription('Bir üyenin uyarılarını gösterir veya temizler.')
    .addUserOption((o) => o.setName('kullanici').setDescription('Üye').setRequired(true))
    .addBooleanOption((o) => o.setName('temizle').setDescription('Tüm uyarıları sil'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('kullanici', true);
    if (i.options.getBoolean('temizle')) {
      const n = clearWarns(i.guildId!, user.id);
      return i.reply({ embeds: [ok(`**${user.tag}** için ${n} uyarı silindi.`)] });
    }
    const warns = getWarns(i.guildId!, user.id);
    const list = warns
      .slice(-10)
      .map((w) => `**#${w.id}** • <t:${Math.floor(w.at / 1000)}:d> • <@${w.modId}>\n└ ${w.reason}`)
      .join('\n');
    return i.reply({ embeds: [info(list || 'Bu üyenin hiç uyarısı yok.', `⚠️ ${user.tag} — ${warns.length} uyarı`)] });
  },
};

export default command;
