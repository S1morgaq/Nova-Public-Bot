import { EmbedBuilder, PermissionFlagsBits, type GuildMember } from 'discord.js';
import { Colors, err, info } from '../../utils/embed';
import { makeCommand } from '../../utils/factory';

const NOMENTION = { allowedMentions: { parse: [] as never[] } };
const t = (ms: number | null | undefined) => (ms ? `<t:${Math.floor(ms / 1000)}:D> (<t:${Math.floor(ms / 1000)}:R>)` : '—');
const names = (list: GuildMember[], n = 30) => list.slice(0, n).map((m) => `${m}`).join(' ') + (list.length > n ? ` … +${list.length - n}` : '');

export default [
  makeCommand({
    name: 'sunucuikon',
    desc: 'Sunucu ikonunu büyük gösterir.',
    category: 'Genel',
    run: async (i) => {
      const url = i.guild!.iconURL({ size: 1024 });
      return i.reply(url ? { embeds: [new EmbedBuilder().setColor(Colors.primary).setTitle(i.guild!.name).setImage(url)] } : { embeds: [err('Sunucunun ikonu yok.')] });
    },
  }),
  makeCommand({
    name: 'sunucubanner',
    desc: 'Sunucu bannerını gösterir.',
    category: 'Genel',
    run: async (i) => {
      const url = i.guild!.bannerURL({ size: 1024 });
      return i.reply(url ? { embeds: [new EmbedBuilder().setColor(Colors.primary).setTitle(i.guild!.name).setImage(url)] } : { embeds: [err('Sunucunun bannerı yok.')] });
    },
  }),
  makeCommand({
    name: 'rastgeleuye',
    desc: 'Sunucudan rastgele bir üye seçer.',
    category: 'Genel',
    aliases: ['randomuser'],
    run: async (i) => {
      await i.guild!.members.fetch();
      const humans = [...i.guild!.members.cache.filter((m) => !m.user.bot).values()];
      const pick = humans[Math.floor(Math.random() * humans.length)];
      return i.reply({ embeds: [info(`🎲 ${pick}`, 'Rastgele Üye')], ...NOMENTION });
    },
  }),
  makeCommand({
    name: 'uyesayisi',
    desc: 'Üye, insan ve bot sayısını gösterir.',
    category: 'Genel',
    aliases: ['uyesay', 'membercount'],
    run: async (i) => {
      await i.guild!.members.fetch();
      const bots = i.guild!.members.cache.filter((m) => m.user.bot).size;
      return i.reply({ embeds: [info(`👥 Toplam: **${i.guild!.memberCount}**\n🙂 İnsan: **${i.guild!.memberCount - bots}**\n🤖 Bot: **${bots}**`, i.guild!.name)] });
    },
  }),
  makeCommand({
    name: 'botlar',
    desc: 'Sunucudaki botları listeler.',
    category: 'Genel',
    run: async (i) => {
      await i.guild!.members.fetch();
      const bots = [...i.guild!.members.cache.filter((m) => m.user.bot).values()];
      return i.reply({ embeds: [info(names(bots) || 'Bot yok.', `🤖 Botlar (${bots.length})`)], ...NOMENTION });
    },
  }),
  makeCommand({
    name: 'yoneticiler',
    desc: 'Yönetici yetkisi olan üyeleri listeler.',
    category: 'Genel',
    aliases: ['admins'],
    run: async (i) => {
      await i.guild!.members.fetch();
      const admins = [...i.guild!.members.cache.filter((m) => !m.user.bot && m.permissions.has(PermissionFlagsBits.Administrator)).values()];
      return i.reply({ embeds: [info(names(admins) || 'Yönetici yok.', `🛡️ Yöneticiler (${admins.length})`)], ...NOMENTION });
    },
  }),
  makeCommand({
    name: 'boosterlar',
    desc: 'Sunucuyu boostlayan üyeleri listeler.',
    category: 'Genel',
    aliases: ['boosters'],
    run: async (i) => {
      await i.guild!.members.fetch();
      const boosters = [...i.guild!.members.cache.filter((m) => !!m.premiumSince).values()];
      return i.reply({ embeds: [info(names(boosters) || 'Henüz boost yok.', `🚀 Boosterlar (${boosters.length})`)], ...NOMENTION });
    },
  }),
  makeCommand({
    name: 'yeniuyeler',
    desc: 'Sunucuya en son katılan 10 üye.',
    category: 'Genel',
    run: async (i) => {
      await i.guild!.members.fetch();
      const list = [...i.guild!.members.cache.values()].sort((a, b) => (b.joinedTimestamp ?? 0) - (a.joinedTimestamp ?? 0)).slice(0, 10);
      return i.reply({ embeds: [info(list.map((m) => `${m} • ${t(m.joinedTimestamp)}`).join('\n'), '🆕 Yeni Üyeler')], ...NOMENTION });
    },
  }),
  makeCommand({
    name: 'eskiuyeler',
    desc: 'Sunucuya en önce katılan 10 üye.',
    category: 'Genel',
    run: async (i) => {
      await i.guild!.members.fetch();
      const list = [...i.guild!.members.cache.values()].sort((a, b) => (a.joinedTimestamp ?? 0) - (b.joinedTimestamp ?? 0)).slice(0, 10);
      return i.reply({ embeds: [info(list.map((m) => `${m} • ${t(m.joinedTimestamp)}`).join('\n'), '👴 Eski Üyeler')], ...NOMENTION });
    },
  }),
  makeCommand({
    name: 'hesapyasi',
    desc: 'Bir üyenin hesap ve sunucu katılma tarihini gösterir.',
    category: 'Genel',
    aliases: ['accountage'],
    options: (b) => b.addUserOption((o) => o.setName('uye').setDescription('Üye (boşsa sen)')),
    run: async (i) => {
      const user = i.options.getUser('uye') ?? i.user;
      const member = await i.guild!.members.fetch(user.id).catch(() => null);
      return i.reply({ embeds: [info(`**Hesap:** ${t(user.createdTimestamp)}\n**Sunucuya katılma:** ${t(member?.joinedTimestamp)}`, user.tag)] });
    },
  }),
  makeCommand({
    name: 'id',
    desc: 'Kullanıcı, kanal ve sunucu ID\'lerini gösterir.',
    category: 'Genel',
    options: (b) => b.addUserOption((o) => o.setName('uye').setDescription('Üye (boşsa sen)')),
    run: async (i) => {
      const user = i.options.getUser('uye') ?? i.user;
      return i.reply({ embeds: [info(`**Üye:** \`${user.id}\`\n**Kanal:** \`${i.channelId}\`\n**Sunucu:** \`${i.guildId}\``, 'ID\'ler')] });
    },
  }),
];
