import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';

const command: Command = {
  category: 'Ekonomi',
  aliases: ['pay', 'ver'],
  data: new SlashCommandBuilder()
    .setName('gonder')
    .setDescription('Bir üyeye para gönder.')
    .addUserOption((o) => o.setName('uye').setDescription('Alıcı').setRequired(true))
    .addIntegerOption((o) => o.setName('miktar').setDescription('Miktar').setMinValue(1).setRequired(true))
    .setDMPermission(false),
  async execute(i) {
    const target = i.options.getUser('uye', true);
    const amount = i.options.getInteger('miktar', true);
    if (target.bot || target.id === i.user.id) return i.reply({ embeds: [err('Geçersiz alıcı.')], ephemeral: true });
    const from = getUser(i.guildId!, i.user.id);
    if (from.balance < amount) return i.reply({ embeds: [err('Yeterli bakiyen yok.')], ephemeral: true });
    from.balance -= amount;
    getUser(i.guildId!, target.id).balance += amount;
    touch();
    return i.reply({ embeds: [ok(`${target} kullanıcısına **${amount}** ${config.currency} gönderdin.`)] });
  },
};

export default command;
