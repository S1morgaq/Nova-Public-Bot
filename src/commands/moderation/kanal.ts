import { PermissionFlagsBits, SlashCommandBuilder, type TextChannel } from 'discord.js';
import type { Command } from '../../types';
import { ok } from '../../utils/embed';

const command: Command = {
  category: 'Moderasyon',
  data: new SlashCommandBuilder()
    .setName('kanal')
    .setDescription('Kanal yönetimi.')
    .addSubcommand((s) => s.setName('kilitle').setDescription('Kanalı herkese yazmaya kapatır.'))
    .addSubcommand((s) => s.setName('ac').setDescription('Kanal kilidini açar.'))
    .addSubcommand((s) =>
      s
        .setName('yavasmod')
        .setDescription('Yavaş modu ayarlar.')
        .addIntegerOption((o) => o.setName('saniye').setDescription('0 = kapat (en fazla 21600)').setMinValue(0).setMaxValue(21600).setRequired(true)),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false),
  async execute(i) {
    const channel = i.channel as TextChannel;
    switch (i.options.getSubcommand()) {
      case 'kilitle':
        await channel.permissionOverwrites.edit(i.guildId!, { SendMessages: false });
        return i.reply({ embeds: [ok('🔒 Kanal kilitlendi.')] });
      case 'ac':
        await channel.permissionOverwrites.edit(i.guildId!, { SendMessages: null });
        return i.reply({ embeds: [ok('🔓 Kanal kilidi açıldı.')] });
      default: {
        const s = i.options.getInteger('saniye', true);
        await channel.setRateLimitPerUser(s);
        return i.reply({ embeds: [ok(s ? `Yavaş mod **${s} sn** yapıldı.` : 'Yavaş mod kapatıldı.')] });
      }
    }
  },
};

export default command;
