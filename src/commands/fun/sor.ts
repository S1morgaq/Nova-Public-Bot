import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { info } from '../../utils/embed';

const answers = ['Kesinlikle evet.', 'Evet.', 'Büyük ihtimalle.', 'Belirsiz, tekrar sor.', 'Şimdi söylemesem daha iyi.', 'Hayır.', 'Hiç sanmıyorum.', 'Kesinlikle hayır.'];

const command: Command = {
  category: 'Eğlence',
  aliases: ['8ball'],
  data: new SlashCommandBuilder()
    .setName('sor')
    .setDescription('Sihirli 8 topa bir soru sor.')
    .addStringOption((o) => o.setName('soru').setDescription('Sorun').setRequired(true).setMaxLength(200)),
  async execute(i) {
    return i.reply({ embeds: [info(`**${i.options.getString('soru', true)}**\n🎱 ${answers[Math.floor(Math.random() * answers.length)]}`)] });
  },
};

export default command;
