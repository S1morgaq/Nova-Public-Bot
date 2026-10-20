import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { err, formatDuration, ok } from '../../utils/embed';

const COOLDOWN = 24 * 3600_000;

const command: Command = {
  category: 'Ekonomi',
  aliases: ['daily'],
  data: new SlashCommandBuilder().setName('gunluk').setDescription('Günlük ödülünü al.').setDMPermission(false),
  async execute(i) {
    const u = getUser(i.guildId!, i.user.id);
    const left = u.lastDaily + COOLDOWN - Date.now();
    if (left > 0) return i.reply({ embeds: [err(`Günlük ödülünü almışsın. **${formatDuration(left)}** sonra tekrar gel.`)], ephemeral: true });
    const amount = 500 + Math.floor(Math.random() * 251);
    u.balance += amount;
    u.lastDaily = Date.now();
    touch();
    return i.reply({ embeds: [ok(`Günlük ödülün: **${amount}** ${config.currency}`)] });
  },
};

export default command;
