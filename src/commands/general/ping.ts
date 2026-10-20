import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { info } from '../../utils/embed';

const command: Command = {
  category: 'Genel',
  data: new SlashCommandBuilder().setName('ping').setDescription('Botun gecikmesini gösterir.'),
  async execute(i) {
    const sent = await i.reply({ embeds: [info('Ölçülüyor...')], fetchReply: true });
    return i.editReply({ embeds: [info(`📡 Mesaj: **${sent.createdTimestamp - i.createdTimestamp}ms**\n💓 API: **${Math.round(i.client.ws.ping)}ms**`, '🏓 Pong!')] });
  },
};

export default command;
