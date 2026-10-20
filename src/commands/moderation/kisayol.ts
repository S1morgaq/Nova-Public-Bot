import { ChannelType, PermissionFlagsBits, type GuildMember, type TextChannel } from 'discord.js';
import { err, info, ok } from '../../utils/embed';
import { makeCommand } from '../../utils/factory';
import { hierarchyError } from '../../utils/mod';

const textOnly = (c: unknown): c is TextChannel => (c as TextChannel)?.type === ChannelType.GuildText;

/** Sık kullanılan moderasyon işleri için kısa prefix komutları. */
export default [
  makeCommand({
    name: 'kilit',
    desc: 'Bu kanalı herkese yazmaya kapatır.',
    category: 'Moderasyon',
    aliases: ['lock'],
    perms: PermissionFlagsBits.ManageChannels,
    run: async (i) => {
      if (!textOnly(i.channel)) return i.reply({ embeds: [err('Sadece metin kanallarında kullanılır.')] });
      await i.channel.permissionOverwrites.edit(i.guildId!, { SendMessages: false }, { reason: `${i.user.tag}: kilit` });
      return i.reply({ embeds: [ok('🔒 Kanal kilitlendi.')] });
    },
  }),
  makeCommand({
    name: 'kilitac',
    desc: 'Bu kanalın kilidini açar.',
    category: 'Moderasyon',
    aliases: ['unlock'],
    perms: PermissionFlagsBits.ManageChannels,
    run: async (i) => {
      if (!textOnly(i.channel)) return i.reply({ embeds: [err('Sadece metin kanallarında kullanılır.')] });
      await i.channel.permissionOverwrites.edit(i.guildId!, { SendMessages: null }, { reason: `${i.user.tag}: kilitac` });
      return i.reply({ embeds: [ok('🔓 Kanal kilidi açıldı.')] });
    },
  }),
  makeCommand({
    name: 'yavas',
    desc: 'Yavaş modu saniye olarak ayarlar (0 = kapat).',
    category: 'Moderasyon',
    aliases: ['slowmode', 'sm'],
    perms: PermissionFlagsBits.ManageChannels,
    options: (b) => b.addIntegerOption((o) => o.setName('saniye').setDescription('0-21600').setMinValue(0).setMaxValue(21600).setRequired(true)),
    run: async (i) => {
      if (!textOnly(i.channel)) return i.reply({ embeds: [err('Sadece metin kanallarında kullanılır.')] });
      const s = i.options.getInteger('saniye', true);
      await i.channel.setRateLimitPerUser(s);
      return i.reply({ embeds: [ok(s ? `Yavaş mod **${s} sn**.` : 'Yavaş mod kapatıldı.')] });
    },
  }),
  makeCommand({
    name: 'zamanasimi',
    desc: 'Şu an susturulmuş (timeout) üyeleri listeler.',
    category: 'Moderasyon',
    aliases: ['susturulanlar', 'timeouts'],
    perms: PermissionFlagsBits.ModerateMembers,
    run: async (i) => {
      await i.guild!.members.fetch();
      const list = i.guild!.members.cache.filter((m) => (m.communicationDisabledUntilTimestamp ?? 0) > Date.now());
      return i.reply({
        embeds: [info(list.map((m) => `${m} • bitiş <t:${Math.floor(m.communicationDisabledUntilTimestamp! / 1000)}:R>`).join('\n') || 'Susturulmuş kimse yok.', `🔇 Susturulanlar (${list.size})`)],
        allowedMentions: { parse: [] },
      });
    },
  }),
  makeCommand({
    name: 'unmute',
    desc: 'Üyenin susturmasını (timeout) kaldırır.',
    category: 'Moderasyon',
    aliases: ['susturkaldir'],
    perms: PermissionFlagsBits.ModerateMembers,
    options: (b) => b.addUserOption((o) => o.setName('uye').setDescription('Üye').setRequired(true)),
    run: async (i) => {
      const member = (await i.guild!.members.fetch(i.options.getUser('uye', true).id).catch(() => null)) as GuildMember | null;
      if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')] });
      const problem = hierarchyError(i, member);
      if (problem) return i.reply({ embeds: [err(problem)] });
      await member.timeout(null, `${i.user.tag}: unmute`);
      return i.reply({ embeds: [ok(`${member} susturması kaldırıldı.`)], allowedMentions: { parse: [] } });
    },
  }),
];
