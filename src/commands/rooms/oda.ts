import { SlashCommandBuilder, type GuildMember, type VoiceChannel } from 'discord.js';
import { rooms } from '../../db';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';

const command: Command = {
  category: 'Oda',
  aliases: ['room', 'ozeloda'],
  data: new SlashCommandBuilder()
    .setName('oda')
    .setDescription('Kendi özel ses odanı yönet.')
    .addSubcommand((s) => s.setName('kilitle').setDescription('Odaya yeni girişleri kapatır.'))
    .addSubcommand((s) => s.setName('ac').setDescription('Oda kilidini açar.'))
    .addSubcommand((s) => s.setName('limit').setDescription('Kişi sınırı.').addIntegerOption((o) => o.setName('sayi').setDescription('0 = sınırsız').setMinValue(0).setMaxValue(99).setRequired(true)))
    .addSubcommand((s) => s.setName('isim').setDescription('Oda adını değiştirir.').addStringOption((o) => o.setName('ad').setDescription('Yeni ad').setRequired(true).setMaxLength(90)))
    .setDMPermission(false),
  async execute(i) {
    const channel = (i.member as GuildMember).voice.channel as VoiceChannel | null;
    if (!channel || rooms.get(channel.id) !== i.user.id) return i.reply({ embeds: [err('Kendi özel odanda olmalısın.')], ephemeral: true });

    switch (i.options.getSubcommand()) {
      case 'kilitle':
        await channel.permissionOverwrites.edit(i.guildId!, { Connect: false });
        return i.reply({ embeds: [ok('🔒 Oda kilitlendi.')], ephemeral: true });
      case 'ac':
        await channel.permissionOverwrites.edit(i.guildId!, { Connect: null });
        return i.reply({ embeds: [ok('🔓 Oda kilidi açıldı.')], ephemeral: true });
      case 'limit': {
        const n = i.options.getInteger('sayi', true);
        await channel.setUserLimit(n);
        return i.reply({ embeds: [ok(n ? `Kişi sınırı **${n}**.` : 'Kişi sınırı kaldırıldı.')], ephemeral: true });
      }
      default: {
        const name = i.options.getString('ad', true);
        await channel.setName(name);
        return i.reply({ embeds: [ok(`Oda adı **${name}** oldu.`)], ephemeral: true });
      }
    }
  },
};

export default command;
