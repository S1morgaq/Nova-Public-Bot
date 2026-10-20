import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { bots, inviteLink } from '../../registry';
import type { Command } from '../../types';
import { info } from '../../utils/embed';

const command: Command = {
  category: 'Genel',
  aliases: ['invite'],
  data: new SlashCommandBuilder().setName('davet').setDescription('Tüm botların davet bağlantılarını ve web paneli gösterir.'),
  async execute(i) {
    const lines = bots.map((b) => `**[${b.name}](${inviteLink(b.clientId)})** — ${b.modules.join(', ')}`);
    return i.reply({ embeds: [info(`${lines.join('\n')}\n\n🖥️ [Web Panel](${config.dashboardUrl})`, '📨 Botları Ekle')] });
  },
};

export default command;
