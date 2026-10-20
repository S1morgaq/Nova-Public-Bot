import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, SlashCommandBuilder, type TextChannel } from 'discord.js';
import { giveaways, type Giveaway } from '../../db';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';
import { endGiveaway, giveawayEmbed } from '../../utils/giveaway';

const command: Command = {
  category: 'Sistem',
  aliases: ['giveaway', 'gw'],
  data: new SlashCommandBuilder()
    .setName('cekilis')
    .setDescription('Çekiliş yönetimi.')
    .addSubcommand((s) =>
      s
        .setName('baslat')
        .setDescription('Yeni çekiliş başlatır.')
        .addStringOption((o) => o.setName('odul').setDescription('Ödül').setRequired(true).setMaxLength(100))
        .addIntegerOption((o) => o.setName('dakika').setDescription('Süre (dakika)').setMinValue(1).setMaxValue(43200).setRequired(true))
        .addIntegerOption((o) => o.setName('kazanan').setDescription('Kazanan sayısı').setMinValue(1).setMaxValue(20)),
    )
    .addSubcommand((s) => s.setName('bitir').setDescription('Çekilişi hemen bitirir.').addStringOption((o) => o.setName('mesaj_id').setDescription('Çekiliş mesajının ID’si').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    if (i.options.getSubcommand() === 'bitir') {
      const g = giveaways.get(i.options.getString('mesaj_id', true));
      if (!g || g.guildId !== i.guildId || g.ended) return i.reply({ embeds: [err('Aktif çekiliş bulunamadı.')], ephemeral: true });
      await endGiveaway(i.client, g);
      return i.reply({ embeds: [ok('Çekiliş bitirildi.')], ephemeral: true });
    }
    const g: Giveaway = {
      messageId: '',
      guildId: i.guildId!,
      channelId: i.channelId,
      hostId: i.user.id,
      prize: i.options.getString('odul', true),
      winners: i.options.getInteger('kazanan') ?? 1,
      endsAt: Date.now() + i.options.getInteger('dakika', true) * 60_000,
      participants: [],
      ended: false,
    };
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId('gw_join').setLabel('Katıl').setEmoji('🎉').setStyle(ButtonStyle.Success));
    const msg = await (i.channel as TextChannel).send({ embeds: [giveawayEmbed(g)], components: [row] });
    g.messageId = msg.id;
    giveaways.add(g);
    return i.reply({ embeds: [ok('Çekiliş başlatıldı!')], ephemeral: true });
  },
};

export default command;
