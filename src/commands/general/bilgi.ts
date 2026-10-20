import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, version as djsVersion, type GuildMember } from 'discord.js';
import { getUser } from '../../db';
import { bots } from '../../registry';
import type { Command } from '../../types';
import { Colors, err } from '../../utils/embed';

const ts = (ms: number) => `<t:${Math.floor(ms / 1000)}:D> (<t:${Math.floor(ms / 1000)}:R>)`;

const bilgi: Command = {
  category: 'Genel',
  aliases: ['info'],
  data: new SlashCommandBuilder()
    .setName('bilgi')
    .setDescription('Rol, kanal veya bot hakkında bilgi.')
    .addSubcommand((s) => s.setName('rol').setDescription('Rol bilgisi.').addRoleOption((o) => o.setName('rol').setDescription('Rol').setRequired(true)))
    .addSubcommand((s) => s.setName('kanal').setDescription('Kanal bilgisi.').addChannelOption((o) => o.setName('kanal').setDescription('Kanal (boşsa bu kanal)')))
    .addSubcommand((s) => s.setName('bot').setDescription('Bot istatistikleri, çalışma süresi, bellek.'))
    .addSubcommand((s) => s.setName('davet').setDescription('Bir üyenin davet istatistikleri.').addUserOption((o) => o.setName('uye').setDescription('Üye (boşsa sen)')))
    .setDMPermission(false),
  async execute(i) {
    const sub = i.options.getSubcommand();
    if (sub === 'rol') {
      const role = i.guild!.roles.cache.get(i.options.getRole('rol', true).id)!;
      const e = new EmbedBuilder()
        .setColor(role.color || Colors.primary)
        .setTitle(`@${role.name}`)
        .addFields(
          { name: 'ID', value: role.id, inline: true },
          { name: 'Renk', value: role.hexColor, inline: true },
          { name: 'Üye', value: String(role.members.size), inline: true },
          { name: 'Sıra', value: String(role.position), inline: true },
          { name: 'Ayrı gösterilir', value: role.hoist ? 'Evet' : 'Hayır', inline: true },
          { name: 'Etiketlenebilir', value: role.mentionable ? 'Evet' : 'Hayır', inline: true },
          { name: 'Yönetici', value: role.permissions.has(PermissionFlagsBits.Administrator) ? '⚠️ Evet' : 'Hayır', inline: true },
          { name: 'Oluşturulma', value: ts(role.createdTimestamp) },
        );
      return i.reply({ embeds: [e] });
    }
    if (sub === 'kanal') {
      const ch = i.options.getChannel('kanal') ?? i.channel;
      const full = ch && 'id' in ch ? i.guild!.channels.cache.get(ch.id) : null;
      if (!full) return i.reply({ embeds: [err('Kanal bulunamadı.')], ephemeral: true });
      const e = new EmbedBuilder()
        .setColor(Colors.primary)
        .setTitle(`#${full.name}`)
        .addFields(
          { name: 'ID', value: full.id, inline: true },
          { name: 'Tür', value: String(full.type), inline: true },
          { name: 'Kategori', value: full.parent?.name ?? '—', inline: true },
          { name: 'Konu', value: ('topic' in full && full.topic) || '—' },
          { name: 'Oluşturulma', value: ts(full.createdTimestamp ?? 0) },
        );
      return i.reply({ embeds: [e] });
    }
    if (sub === 'davet') {
      const user = i.options.getUser('uye') ?? i.user;
      const d = getUser(i.guildId!, user.id);
      const total = d.invites ?? 0;
      const left = d.invitesLeft ?? 0;
      const by = d.invitedBy ? `<@${d.invitedBy}>` : 'bilinmiyor';
      return i.reply({
        embeds: [new EmbedBuilder().setColor(Colors.primary).setAuthor({ name: user.username, iconURL: user.displayAvatarURL() }).setTitle('📨 Davet İstatistikleri').setDescription(`**${total - left}** aktif davet (${total} toplam, ${left} ayrıldı)\nDavet eden: ${by}`)],
        allowedMentions: { parse: [] },
      });
    }
    const up = Math.floor(process.uptime());
    const mem = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);
    const e = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle('🤖 Bot Bilgisi')
      .addFields(
        { name: 'Bu bot', value: i.client.botName, inline: true },
        { name: 'Çalışma süresi', value: `${Math.floor(up / 86400)}g ${Math.floor((up % 86400) / 3600)}s ${Math.floor((up % 3600) / 60)}dk`, inline: true },
        { name: 'Ping', value: `${Math.round(i.client.ws.ping)}ms`, inline: true },
        { name: 'Sunucu', value: String(i.client.guilds.cache.size), inline: true },
        { name: 'Komut', value: String(i.client.commands.size), inline: true },
        { name: 'Bellek', value: `${mem} MB`, inline: true },
        { name: 'Çalışan bot', value: String(bots.length), inline: true },
        { name: 'Sürüm', value: `Node ${process.version} • discord.js ${djsVersion}`, inline: false },
      );
    return i.reply({ embeds: [e] });
  },
};

const banner: Command = {
  category: 'Genel',
  data: new SlashCommandBuilder()
    .setName('banner')
    .setDescription('Bir kullanıcının profil bannerını gösterir.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye')),
  async execute(i) {
    const user = await i.client.users.fetch((i.options.getUser('uye') ?? i.user).id, { force: true });
    const url = user.bannerURL({ size: 1024 });
    if (!url) return i.reply({ embeds: [err(`**${user.username}** kullanıcısının bannerı yok.`)], ephemeral: true });
    return i.reply({ embeds: [new EmbedBuilder().setColor(user.accentColor ?? Colors.primary).setTitle(user.tag).setImage(url)] });
  },
};

const KEY_PERMS: [bigint, string][] = [
  [PermissionFlagsBits.Administrator, 'Yönetici'],
  [PermissionFlagsBits.ManageGuild, 'Sunucuyu Yönet'],
  [PermissionFlagsBits.ManageRoles, 'Rolleri Yönet'],
  [PermissionFlagsBits.ManageChannels, 'Kanalları Yönet'],
  [PermissionFlagsBits.ManageMessages, 'Mesajları Yönet'],
  [PermissionFlagsBits.BanMembers, 'Üyeleri Yasakla'],
  [PermissionFlagsBits.KickMembers, 'Üyeleri At'],
  [PermissionFlagsBits.ModerateMembers, 'Üyeleri Sustur'],
  [PermissionFlagsBits.MentionEveryone, '@everyone Etiketle'],
  [PermissionFlagsBits.ViewAuditLog, 'Denetim Kaydı'],
];

const yetkiler: Command = {
  category: 'Genel',
  aliases: ['perms'],
  data: new SlashCommandBuilder()
    .setName('yetkiler')
    .setDescription('Bir üyenin önemli sunucu yetkilerini listeler.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye'))
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('uye') ?? i.user;
    const member = (await i.guild!.members.fetch(user.id).catch(() => null)) as GuildMember | null;
    if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
    const lines = KEY_PERMS.map(([p, name]) => `${member.permissions.has(p) ? '✅' : '▫️'} ${name}`);
    return i.reply({ embeds: [new EmbedBuilder().setColor(Colors.primary).setTitle(`🔑 ${user.username}`).setDescription(lines.join('\n'))] });
  },
};

export default [bilgi, banner, yetkiler];
