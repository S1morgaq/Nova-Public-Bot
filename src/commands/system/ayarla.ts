import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getGuild, updateGuild } from '../../db';
import type { Command } from '../../types';
import { config } from '../../config';
import { ok } from '../../utils/embed';

const textChannel = (name: string, desc: string, required = true) => (o: import('discord.js').SlashCommandChannelOption) =>
  o.setName(name).setDescription(desc).addChannelTypes(ChannelType.GuildText).setRequired(required);

const voiceChannel = (name: string, desc: string) => (o: import('discord.js').SlashCommandChannelOption) =>
  o.setName(name).setDescription(desc).addChannelTypes(ChannelType.GuildVoice).setRequired(true);

const command: Command = {
  category: 'Sistem',
  aliases: ['settings', 'setup'],
  data: new SlashCommandBuilder()
    .setName('ayarla')
    .setDescription('Sunucu ayarlarını yapılandır. (Web panelden de yapılabilir)')
    .addSubcommand((s) => s.setName('log').setDescription('Log kanalını ayarla.').addChannelOption(textChannel('kanal', 'Log kanalı')))
    .addSubcommand((s) =>
      s
        .setName('hosgeldin')
        .setDescription('Hoş geldin kanalı ve mesajı. Değişkenler: {user} {server} {count}')
        .addChannelOption(textChannel('kanal', 'Kanal'))
        .addStringOption((o) => o.setName('mesaj').setDescription('Mesaj').setMaxLength(500)),
    )
    .addSubcommand((s) => s.setName('ayrilma').setDescription('Ayrılma mesajı kanalı.').addChannelOption(textChannel('kanal', 'Kanal')))
    .addSubcommand((s) => s.setName('otorol').setDescription('Yeni üyelere verilecek rol.').addRoleOption((o) => o.setName('rol').setDescription('Rol').setRequired(true)))
    .addSubcommand((s) =>
      s
        .setName('automod')
        .setDescription('AutoMod özelliklerini aç/kapat.')
        .addStringOption((o) =>
          o
            .setName('ozellik')
            .setDescription('Özellik')
            .setRequired(true)
            .addChoices({ name: 'Davet linkleri', value: 'invites' }, { name: 'Tüm linkler', value: 'links' }, { name: 'Büyük harf', value: 'caps' }, { name: 'Spam', value: 'spam' }),
        )
        .addBooleanOption((o) => o.setName('durum').setDescription('Açık mı?').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('seviye').setDescription('Seviye sistemini aç/kapat.').addBooleanOption((o) => o.setName('durum').setDescription('Açık mı?').setRequired(true)))
    .addSubcommand((s) => s.setName('prefix').setDescription('Prefix ayarla.').addStringOption((o) => o.setName('deger').setDescription('Yeni prefix (örn. ! . ?)').setRequired(true).setMaxLength(3)))
    .addSubcommand((s) =>
      s
        .setName('yildiz')
        .setDescription('Starboard kanalı: ⭐ alan mesajlar buraya düşer.')
        .addChannelOption(textChannel('kanal', 'Starboard kanalı'))
        .addIntegerOption((o) => o.setName('esik').setDescription('Gereken ⭐ sayısı (varsayılan 3)').setMinValue(1).setMaxValue(25)),
    )
    .addSubcommand((s) =>
      s
        .setName('antiraid')
        .setDescription('Raid koruması: kısa sürede çok üye girerse otomatik atar.')
        .addBooleanOption((o) => o.setName('durum').setDescription('Açık mı?').setRequired(true))
        .addIntegerOption((o) => o.setName('giris').setDescription('Kaç girişte tetiklensin (varsayılan 5)').setMinValue(2).setMaxValue(50))
        .addIntegerOption((o) => o.setName('saniye').setDescription('Kaç saniye içinde (varsayılan 10)').setMinValue(3).setMaxValue(120))
        .addIntegerOption((o) => o.setName('hesap_yasi').setDescription('Bu günden yeni hesapları at (0 = kapalı)').setMinValue(0).setMaxValue(365)),
    )
    .addSubcommand((s) =>
      s
        .setName('kayit')
        .setDescription('Kayıt sistemini kur.')
        .addRoleOption((o) => o.setName('uye_rolu').setDescription('Kayıttan sonra verilecek rol').setRequired(true))
        .addRoleOption((o) => o.setName('yetkili_rol').setDescription('Kayıt yapabilecek yetkili rolü'))
        .addRoleOption((o) => o.setName('kayitsiz_rol').setDescription('Girişte verilip kayıtta alınacak rol')),
    )
    .addSubcommand((s) =>
      s
        .setName('jail')
        .setDescription('Jail (cezalı) rolünü ayarla.')
        .addRoleOption((o) => o.setName('rol').setDescription('Cezalı rolü (kanalları görmemeli)').setRequired(true)),
    )
    .addSubcommand((s) => s.setName('oda').setDescription('Özel oda: bu ses kanalına giren kendi odasını açar.').addChannelOption(voiceChannel('kanal', 'Hub ses kanalı')))
    .addSubcommand((s) => s.setName('sayac').setDescription('Üye sayısını gösteren ses kanalı (10 dk\'da bir güncellenir).').addChannelOption(voiceChannel('kanal', 'Sayaç kanalı')))
    .addSubcommand((s) => s.setName('panel').setDescription('Web panel bağlantısını gösterir.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false),
  async execute(i) {
    const id = i.guildId!;
    const sub = i.options.getSubcommand();
    switch (sub) {
      case 'log': {
        const ch = i.options.getChannel('kanal', true);
        updateGuild(id, { logChannel: ch.id });
        return i.reply({ embeds: [ok(`Log kanalı ${ch} olarak ayarlandı.`)] });
      }
      case 'hosgeldin': {
        const ch = i.options.getChannel('kanal', true);
        const msg = i.options.getString('mesaj');
        updateGuild(id, { welcomeChannel: ch.id, ...(msg ? { welcomeMessage: msg } : {}) });
        return i.reply({ embeds: [ok(`Hoş geldin kanalı ${ch} olarak ayarlandı.`)] });
      }
      case 'ayrilma': {
        const ch = i.options.getChannel('kanal', true);
        updateGuild(id, { goodbyeChannel: ch.id });
        return i.reply({ embeds: [ok(`Ayrılma kanalı ${ch} olarak ayarlandı.`)] });
      }
      case 'otorol': {
        const role = i.options.getRole('rol', true);
        updateGuild(id, { autoRole: role.id });
        return i.reply({ embeds: [ok(`Otorol ${role} olarak ayarlandı.`)] });
      }
      case 'automod': {
        const key = i.options.getString('ozellik', true) as 'invites' | 'links' | 'caps' | 'spam';
        const on = i.options.getBoolean('durum', true);
        updateGuild(id, { automod: { ...getGuild(id).automod, [key]: on } });
        return i.reply({ embeds: [ok(`AutoMod **${key}** ${on ? 'açıldı' : 'kapatıldı'}.`)] });
      }
      case 'seviye': {
        const on = i.options.getBoolean('durum', true);
        updateGuild(id, { levelEnabled: on });
        return i.reply({ embeds: [ok(`Seviye sistemi ${on ? 'açıldı' : 'kapatıldı'}.`)] });
      }
      case 'kayit': {
        const member = i.options.getRole('uye_rolu', true);
        const staff = i.options.getRole('yetkili_rol');
        const unreg = i.options.getRole('kayitsiz_rol');
        updateGuild(id, { registerMemberRole: member.id, registerStaffRole: staff?.id ?? null, registerUnregRole: unreg?.id ?? null });
        return i.reply({ embeds: [ok(`Kayıt sistemi kuruldu. Üye rolü: ${member}${unreg ? ` • Kayıtsız: ${unreg}` : ''}`)], allowedMentions: { parse: [] } });
      }
      case 'jail': {
        const role = i.options.getRole('rol', true);
        updateGuild(id, { jailRole: role.id });
        return i.reply({ embeds: [ok(`Jail rolü ${role} olarak ayarlandı. Bu rolün kanalları görmesini engellemeyi unutma.`)], allowedMentions: { parse: [] } });
      }
      case 'oda': {
        const ch = i.options.getChannel('kanal', true);
        updateGuild(id, { roomHub: ch.id });
        return i.reply({ embeds: [ok(`Özel oda hub kanalı **${ch.name}** olarak ayarlandı.`)] });
      }
      case 'sayac': {
        const ch = i.options.getChannel('kanal', true);
        updateGuild(id, { counterChannel: ch.id });
        return i.reply({ embeds: [ok(`Üye sayacı **${ch.name}** kanalına bağlandı.`)] });
      }
      case 'prefix': {
        const prefix = i.options.getString('deger', true).trim();
        updateGuild(id, { prefix });
        return i.reply({ embeds: [ok(`Prefix \`${prefix}\` olarak ayarlandı.`)] });
      }
      case 'yildiz': {
        const ch = i.options.getChannel('kanal', true);
        const esik = i.options.getInteger('esik') ?? 3;
        updateGuild(id, { starChannel: ch.id, starThreshold: esik });
        return i.reply({ embeds: [ok(`Starboard ${ch} olarak ayarlandı (${esik} ⭐).`)] });
      }
      case 'antiraid': {
        const cur = getGuild(id).antiRaid;
        const next = {
          enabled: i.options.getBoolean('durum', true),
          joins: i.options.getInteger('giris') ?? cur.joins,
          seconds: i.options.getInteger('saniye') ?? cur.seconds,
          minAccountDays: i.options.getInteger('hesap_yasi') ?? cur.minAccountDays,
        };
        updateGuild(id, { antiRaid: next });
        return i.reply({ embeds: [ok(next.enabled ? `Anti-raid açık: ${next.seconds} sn içinde ${next.joins} giriş • min hesap yaşı ${next.minAccountDays} gün.` : 'Anti-raid kapatıldı.')] });
      }
      default:
        return i.reply({ embeds: [ok(`Web panel: ${config.dashboardUrl}/dashboard/${id}`)], ephemeral: true });
    }
  },
};

export default command;
