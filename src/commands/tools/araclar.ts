import { EmbedBuilder, SlashCommandBuilder, type Message, type TextChannel } from 'discord.js';
import type { Command } from '../../types';
import { Colors, embed, err, ok } from '../../utils/embed';

const renk: Command = {
  category: 'Araçlar',
  aliases: ['color', 'hex'],
  data: new SlashCommandBuilder()
    .setName('renk')
    .setDescription('Hex rengin önizlemesini ve RGB değerini gösterir.')
    .addStringOption((o) => o.setName('hex').setDescription('Örn. #5865f2').setRequired(true).setMaxLength(7)),
  async execute(i) {
    const hex = i.options.getString('hex', true).replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return i.reply({ embeds: [err('Geçerli bir hex renk gir (örn. #5865f2).')], ephemeral: true });
    const n = parseInt(hex, 16);
    return i.reply({
      embeds: [new EmbedBuilder().setColor(n).setTitle(`#${hex.toUpperCase()}`).setDescription(`RGB: **${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}**`).setThumbnail(`https://singlecolorimage.com/get/${hex}/200x200`)],
    });
  },
};

const qr: Command = {
  category: 'Araçlar',
  data: new SlashCommandBuilder()
    .setName('qr')
    .setDescription('Metin veya bağlantıdan QR kod üretir.')
    .addStringOption((o) => o.setName('metin').setDescription('Metin / bağlantı').setRequired(true).setMaxLength(500)),
  async execute(i) {
    const data = encodeURIComponent(i.options.getString('metin', true));
    return i.reply({ embeds: [new EmbedBuilder().setColor(Colors.dark).setTitle('QR Kod').setImage(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${data}`)] });
  },
};

const zaman: Command = {
  category: 'Araçlar',
  aliases: ['timestamp'],
  data: new SlashCommandBuilder()
    .setName('zaman')
    .setDescription('Tarihi Discord zaman damgasına çevirir (herkese kendi saatinde görünür).')
    .addStringOption((o) => o.setName('tarih').setDescription('YYYY-AA-GG veya YYYY-AA-GG SS:DD (Türkiye saati). Boşsa şimdi.').setMaxLength(20)),
  async execute(i) {
    const raw = i.options.getString('tarih')?.trim();
    let ms = Date.now();
    if (raw) {
      const m = raw.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?$/);
      ms = m ? Date.parse(`${m[1]}T${m[2] ?? '00:00'}:00+03:00`) : NaN;
      if (Number.isNaN(ms)) return i.reply({ embeds: [err('Biçim: `2026-12-31` veya `2026-12-31 23:59`')], ephemeral: true });
    }
    const t = Math.floor(ms / 1000);
    const rows = [['t', 'Kısa saat'], ['T', 'Uzun saat'], ['d', 'Kısa tarih'], ['D', 'Uzun tarih'], ['f', 'Tarih + saat'], ['F', 'Tam'], ['R', 'Göreli']].map(([f, name]) => `${name}: <t:${t}:${f}> → \`<t:${t}:${f}>\``);
    return i.reply({ embeds: [embed(Colors.primary, rows.join('\n'), '🕒 Zaman Damgası')] });
  },
};

const oneri: Command = {
  category: 'Araçlar',
  aliases: ['suggest'],
  data: new SlashCommandBuilder()
    .setName('oneri')
    .setDescription('Bu kanala oylanabilir bir öneri gönderir.')
    .addStringOption((o) => o.setName('metin').setDescription('Önerin').setRequired(true).setMaxLength(1000))
    .setDMPermission(false),
  async execute(i) {
    const e = new EmbedBuilder()
      .setColor(Colors.warn)
      .setAuthor({ name: `${i.user.username} önerdi`, iconURL: i.user.displayAvatarURL() })
      .setDescription(i.options.getString('metin', true))
      .setFooter({ text: '👍 katılıyorum • 👎 katılmıyorum' })
      .setTimestamp();
    const sent: Message = await (i.channel as TextChannel).send({ embeds: [e] });
    await sent.react('👍').catch(() => null);
    await sent.react('👎').catch(() => null);
    return i.reply({ embeds: [ok('Önerin gönderildi.')], ephemeral: true });
  },
};

export default [renk, qr, zaman, oneri];
