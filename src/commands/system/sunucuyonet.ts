import {
  ChannelType,
  EmbedBuilder,
  GuildDefaultMessageNotifications,
  GuildVerificationLevel,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import type { Command } from '../../types';
import { Colors, err, info, ok } from '../../utils/embed';

const command: Command = {
  category: 'Sistem',
  aliases: ['serverman', 'sunucuayar'],
  data: new SlashCommandBuilder()
    .setName('sunucuyonet')
    .setDescription('Sunucu ayarları: ad, ikon, davetler, doğrulama seviyesi, istatistik...')
    .addSubcommand((s) => s.setName('isim').setDescription('Sunucu adını değiştirir.').addStringOption((o) => o.setName('ad').setDescription('Yeni ad').setRequired(true).setMinLength(2).setMaxLength(100)))
    .addSubcommand((s) => s.setName('ikon').setDescription('Sunucu ikonunu bir resim bağlantısından ayarlar.').addStringOption((o) => o.setName('url').setDescription('Resim bağlantısı (png/jpg/gif)').setRequired(true).setMaxLength(500)))
    .addSubcommand((s) =>
      s
        .setName('bildirim')
        .setDescription('Varsayılan bildirim ayarı.')
        .addStringOption((o) => o.setName('tur').setDescription('Ayar').setRequired(true).addChoices({ name: 'Tüm mesajlar', value: 'all' }, { name: 'Sadece etiketler', value: 'mentions' })),
    )
    .addSubcommand((s) =>
      s
        .setName('dogrulama')
        .setDescription('Üye doğrulama seviyesi.')
        .addIntegerOption((o) =>
          o
            .setName('seviye')
            .setDescription('Seviye')
            .setRequired(true)
            .addChoices({ name: 'Yok', value: 0 }, { name: 'Düşük (e-posta)', value: 1 }, { name: 'Orta (5 dk hesap)', value: 2 }, { name: 'Yüksek (10 dk üyelik)', value: 3 }, { name: 'En yüksek (telefon)', value: 4 }),
        ),
    )
    .addSubcommand((s) => s.setName('sistemkanal').setDescription('Sistem mesajları kanalı (katılma/boost).').addChannelOption((o) => o.setName('kanal').setDescription('Yazı kanalı').addChannelTypes(ChannelType.GuildText).setRequired(true)))
    .addSubcommand((s) =>
      s
        .setName('afk')
        .setDescription('AFK ses kanalını ayarlar.')
        .addChannelOption((o) => o.setName('kanal').setDescription('Ses kanalı').addChannelTypes(ChannelType.GuildVoice).setRequired(true))
        .addIntegerOption((o) => o.setName('dakika').setDescription('Kaç dk sonra').addChoices({ name: '1', value: 60 }, { name: '5', value: 300 }, { name: '15', value: 900 }, { name: '30', value: 1800 }, { name: '60', value: 3600 })),
    )
    .addSubcommand((s) => s.setName('davetler').setDescription('En çok kullanılan 10 daveti listeler.'))
    .addSubcommand((s) =>
      s
        .setName('davetolustur')
        .setDescription('Bu kanal için davet bağlantısı oluşturur.')
        .addIntegerOption((o) => o.setName('saat').setDescription('Kaç saat geçerli (0 = süresiz)').setMinValue(0).setMaxValue(168))
        .addIntegerOption((o) => o.setName('kullanim').setDescription('En fazla kullanım (0 = sınırsız)').setMinValue(0).setMaxValue(100)),
    )
    .addSubcommand((s) => s.setName('istatistik').setDescription('Sunucu istatistikleri: üye, bot, kanal, rol, boost, emoji.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    const guild = i.guild!;
    const sub = i.options.getSubcommand();
    const reason = `${i.user.tag}: sunucuyonet ${sub}`;

    switch (sub) {
      case 'isim': {
        await guild.setName(i.options.getString('ad', true), reason);
        return i.reply({ embeds: [ok(`Sunucu adı **${guild.name}** oldu.`)] });
      }
      case 'ikon': {
        const url = i.options.getString('url', true);
        if (!/^https?:\/\/\S+\.(png|jpe?g|gif|webp)(\?\S*)?$/i.test(url)) return i.reply({ embeds: [err('Geçerli bir resim bağlantısı gir.')], ephemeral: true });
        await guild.setIcon(url, reason);
        return i.reply({ embeds: [ok('Sunucu ikonu güncellendi.')] });
      }
      case 'bildirim': {
        const all = i.options.getString('tur', true) === 'all';
        await guild.setDefaultMessageNotifications(all ? GuildDefaultMessageNotifications.AllMessages : GuildDefaultMessageNotifications.OnlyMentions, reason);
        return i.reply({ embeds: [ok(`Varsayılan bildirim: **${all ? 'tüm mesajlar' : 'sadece etiketler'}**`)] });
      }
      case 'dogrulama': {
        const level = i.options.getInteger('seviye', true) as GuildVerificationLevel;
        await guild.setVerificationLevel(level, reason);
        return i.reply({ embeds: [ok(`Doğrulama seviyesi **${GuildVerificationLevel[level]}** yapıldı.`)] });
      }
      case 'sistemkanal': {
        const ch = i.options.getChannel('kanal', true);
        await guild.setSystemChannel(ch.id, reason);
        return i.reply({ embeds: [ok(`Sistem kanalı <#${ch.id}> yapıldı.`)] });
      }
      case 'afk': {
        const ch = i.options.getChannel('kanal', true);
        await guild.setAFKChannel(ch.id, reason);
        await guild.setAFKTimeout((i.options.getInteger('dakika') ?? 300) as 60 | 300 | 900 | 1800 | 3600, reason);
        return i.reply({ embeds: [ok(`AFK kanalı **${ch.name}** yapıldı.`)] });
      }
      case 'davetler': {
        const invites = await guild.invites.fetch().catch(() => null);
        if (!invites) return i.reply({ embeds: [err('Davetler alınamadı (yetki eksik olabilir).')], ephemeral: true });
        const top = [...invites.values()].sort((a, b) => (b.uses ?? 0) - (a.uses ?? 0)).slice(0, 10);
        return i.reply({ embeds: [info(top.map((v) => `\`${v.code}\` • ${v.uses ?? 0} kullanım • ${v.inviter?.username ?? '?'} • <#${v.channelId}>`).join('\n') || 'Davet yok.', `📨 Davetler (${invites.size})`)] });
      }
      case 'davetolustur': {
        const hours = i.options.getInteger('saat') ?? 24;
        const invite = await (i.channel as TextChannel).createInvite({ maxAge: hours * 3600, maxUses: i.options.getInteger('kullanim') ?? 0, unique: true, reason });
        return i.reply({ embeds: [ok(`Davet hazır: ${invite.url}`)], ephemeral: true });
      }
      default: {
        await guild.members.fetch();
        const bots = guild.members.cache.filter((m) => m.user.bot).size;
        const ch = guild.channels.cache;
        const e = new EmbedBuilder()
          .setColor(Colors.primary)
          .setTitle(guild.name)
          .setThumbnail(guild.iconURL({ size: 256 }))
          .addFields(
            { name: '👥 Üye', value: `${guild.memberCount - bots} insan • ${bots} bot`, inline: true },
            { name: '💬 Kanal', value: `${ch.filter((c) => c.type === ChannelType.GuildText).size} yazı • ${ch.filter((c) => c.type === ChannelType.GuildVoice).size} ses • ${ch.filter((c) => c.type === ChannelType.GuildCategory).size} kategori`, inline: true },
            { name: '🎭 Rol', value: String(guild.roles.cache.size - 1), inline: true },
            { name: '🚀 Boost', value: `${guild.premiumSubscriptionCount ?? 0} (Seviye ${guild.premiumTier})`, inline: true },
            { name: '😀 Emoji', value: `${guild.emojis.cache.filter((x) => !x.animated).size} sabit • ${guild.emojis.cache.filter((x) => x.animated).size} hareketli`, inline: true },
            { name: '🛡️ Doğrulama', value: GuildVerificationLevel[guild.verificationLevel], inline: true },
          );
        return i.reply({ embeds: [e] });
      }
    }
  },
};

export default command;
