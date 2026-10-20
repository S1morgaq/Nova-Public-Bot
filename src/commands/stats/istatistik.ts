import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getUser } from '../../db';
import type { Command } from '../../types';
import { Colors } from '../../utils/embed';

const hm = (s: number) => `${Math.floor(s / 3600)} sa ${Math.floor((s % 3600) / 60)} dk`;

const command: Command = {
  category: 'Araçlar',
  aliases: ['stat', 'stats', 'istatistikler'],
  data: new SlashCommandBuilder()
    .setName('istatistik')
    .setDescription('Bir üyenin mesaj, ses ve kayıt istatistiklerini gösterir.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye'))
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('uye') ?? i.user;
    const d = getUser(i.guildId!, user.id);
    const e = new EmbedBuilder()
      .setColor(Colors.primary)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .addFields(
        { name: '💬 Mesaj', value: String(d.messages), inline: true },
        { name: '🎙️ Ses', value: hm(d.voiceSeconds ?? 0), inline: true },
        { name: '📈 Seviye', value: String(d.level), inline: true },
        { name: '📝 Kayıt ettiği', value: String(d.registered ?? 0), inline: true },
      );
    return i.reply({ embeds: [e] });
  },
};

export default command;
