import { SlashCommandBuilder } from 'discord.js';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { ok } from '../../utils/embed';

const command: Command = {
  category: 'Araçlar',
  data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('AFK durumuna geç. Etiketlenirsen sebep gösterilir.')
    .addStringOption((o) => o.setName('sebep').setDescription('Sebep').setMaxLength(100))
    .setDMPermission(false),
  async execute(i) {
    const reason = i.options.getString('sebep') ?? 'AFK';
    getUser(i.guildId!, i.user.id).afk = { reason, since: Date.now() };
    touch();
    return i.reply({ embeds: [ok(`AFK oldun: ${reason}`)], allowedMentions: { parse: [] } });
  },
};

export default command;
