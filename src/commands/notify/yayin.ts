import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { streamers } from '../../db';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const DEFAULTS = {
  youtube: '📺 **{user}** yeni video yükledi! {url}',
  twitch: '🔴 **{user}** yayında! {url}',
};

const command: Command = {
  category: 'Yayın',
  aliases: ['stream', 'bildirim'],
  data: new SlashCommandBuilder()
    .setName('yayin')
    .setDescription('YouTube yeni video ve Twitch canlı yayın bildirimleri.')
    .addSubcommand((s) =>
      s
        .setName('ekle')
        .setDescription('Bildirim ekler. Mesajda {user} {title} {url} kullanılabilir.')
        .addStringOption((o) => o.setName('platform').setDescription('Platform').setRequired(true).addChoices({ name: 'YouTube', value: 'youtube' }, { name: 'Twitch', value: 'twitch' }))
        .addStringOption((o) => o.setName('hedef').setDescription('YouTube kanal ID veya Twitch kullanıcı adı').setRequired(true).setMaxLength(60))
        .addChannelOption((o) => o.setName('kanal').setDescription('Bildirim kanalı').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true))
        .addStringOption((o) => o.setName('mesaj').setDescription('Özel mesaj (@everyone yazabilirsin)').setMaxLength(500)),
    )
    .addSubcommand((s) => s.setName('sil').setDescription('Bildirimi siler.').addIntegerOption((o) => o.setName('id').setDescription('Liste ID').setRequired(true)))
    .addSubcommand((s) => s.setName('liste').setDescription('Bildirimleri listeler.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    const sub = i.options.getSubcommand();
    if (sub === 'liste') {
      const list = streamers.all().filter((s) => s.guildId === i.guildId);
      return i.reply({ embeds: [info(list.map((s) => `**#${s.id}** ${s.platform === 'youtube' ? '📺' : '🟣'} \`${s.target}\` → <#${s.channelId}>`).join('\n') || 'Hiç bildirim yok.', 'Yayın Bildirimleri')] });
    }
    if (sub === 'sil') {
      const done = streamers.remove(i.guildId!, i.options.getInteger('id', true));
      return i.reply({ embeds: [done ? ok('Bildirim silindi.') : err('Bu ID bulunamadı.')] });
    }

    const platform = i.options.getString('platform', true) as 'youtube' | 'twitch';
    const target = i.options.getString('hedef', true).trim();
    if (platform === 'youtube' && !/^UC[\w-]{20,}$/.test(target)) return i.reply({ embeds: [err('YouTube için kanal ID gerekli (UC ile başlar). Kanal sayfası → Hakkında → Kanalı paylaş → Kanal ID\'sini kopyala.')], ephemeral: true });
    if (platform === 'twitch' && (!config.twitchClientId || !config.twitchClientSecret)) return i.reply({ embeds: [err('Twitch için `.env` dosyasında TWITCH_CLIENT_ID ve TWITCH_CLIENT_SECRET tanımlı olmalı.')], ephemeral: true });

    const channel = i.options.getChannel('kanal', true);
    const entry = streamers.add({ guildId: i.guildId!, platform, target, channelId: channel.id, message: i.options.getString('mesaj') ?? DEFAULTS[platform] });
    return i.reply({ embeds: [ok(`Bildirim eklendi (#${entry.id}). Yeni ${platform === 'youtube' ? 'video' : 'yayın'} olunca ${channel} kanalına yazacağım. (3 dk'da bir kontrol edilir)`)] });
  },
};

export default command;
