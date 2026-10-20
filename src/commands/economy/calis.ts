import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { err, formatDuration, ok } from '../../utils/embed';

const COOLDOWN = 3600_000;
const jobs = ['kurye olarak çalıştın', 'kod yazdın', 'garsonluk yaptın', 'araba yıkadın', 'freelance logo tasarladın', 'sokakta müzik yaptın'];

const command: Command = {
  category: 'Ekonomi',
  aliases: ['work'],
  data: new SlashCommandBuilder().setName('calis').setDescription('Çalışıp para kazan. (1 saat bekleme)').setDMPermission(false),
  async execute(i) {
    const u = getUser(i.guildId!, i.user.id);
    const left = u.lastWork + COOLDOWN - Date.now();
    if (left > 0) return i.reply({ embeds: [err(`Yorgunsun! **${formatDuration(left)}** sonra tekrar çalışabilirsin.`)], ephemeral: true });
    const amount = 50 + Math.floor(Math.random() * 151);
    u.balance += amount;
    u.lastWork = Date.now();
    touch();
    return i.reply({ embeds: [ok(`${jobs[Math.floor(Math.random() * jobs.length)]} ve **${amount}** ${config.currency} kazandın.`)] });
  },
};

export default command;
