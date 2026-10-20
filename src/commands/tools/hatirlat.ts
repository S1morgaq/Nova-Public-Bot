import { SlashCommandBuilder } from 'discord.js';
import { reminders } from '../../db';
import type { Command } from '../../types';
import { ok } from '../../utils/embed';

const command: Command = {
  category: 'Araçlar',
  aliases: ['remind', 'remindme'],
  data: new SlashCommandBuilder()
    .setName('hatirlat')
    .setDescription('Belirtilen süre sonra seni etiketleyerek hatırlatır.')
    .addIntegerOption((o) => o.setName('dakika').setDescription('Kaç dakika sonra (en fazla 10080)').setMinValue(1).setMaxValue(10080).setRequired(true))
    .addStringOption((o) => o.setName('mesaj').setDescription('Hatırlatılacak şey').setRequired(true).setMaxLength(300)),
  async execute(i) {
    const minutes = i.options.getInteger('dakika', true);
    const at = Date.now() + minutes * 60_000;
    reminders.add({ userId: i.user.id, channelId: i.channelId, text: i.options.getString('mesaj', true), at });
    return i.reply({ embeds: [ok(`Tamam, <t:${Math.floor(at / 1000)}:R> hatırlatacağım.`)] });
  },
};

export default command;
