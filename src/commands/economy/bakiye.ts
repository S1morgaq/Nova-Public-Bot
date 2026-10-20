import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser } from '../../db';
import type { Command } from '../../types';
import { info } from '../../utils/embed';

const command: Command = {
  category: 'Ekonomi',
  aliases: ['bal', 'balance', 'para'],
  data: new SlashCommandBuilder()
    .setName('bakiye')
    .setDescription('Bakiyeni gösterir.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye'))
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('uye') ?? i.user;
    return i.reply({ embeds: [info(`${user} bakiyesi: **${getUser(i.guildId!, user.id).balance}** ${config.currency}`)] });
  },
};

export default command;
