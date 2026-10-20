import { SlashCommandBuilder, type TextChannel } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { pickOne, rand } from '../../utils/cooldown';
import { Colors, embed, err } from '../../utils/embed';
import { emoji } from '../../utils/emojis';
import { sleep } from '../../utils/http';

const sayitahmin: Command = {
  category: 'Eğlence',
  aliases: ['guess'],
  data: new SlashCommandBuilder().setName('sayitahmin').setDescription('Botun tuttuğu 1-100 arası sayıyı 8 hakta bul. Tahminleri kanala yaz.').setDMPermission(false),
  async execute(i) {
    const target = rand(1, 100);
    let tries = 0;
    await i.reply({ embeds: [embed(Colors.primary, '1 ile 100 arasında bir sayı tuttum! **8 hakkın** ve 90 saniyen var.\nTahminini sohbete yaz.', '🔢 Sayı Tahmini')] });
    const channel = i.channel as TextChannel;
    const collector = channel.createMessageCollector({ filter: (m) => m.author.id === i.user.id && /^\d{1,3}$/.test(m.content.trim()), time: 90_000 });
    collector.on('collect', (m) => {
      tries++;
      const n = Number(m.content);
      if (n === target) {
        collector.stop('win');
        void m.reply({ embeds: [embed(Colors.success, `🎉 Doğru! Sayı **${target}** idi. ${tries} denemede buldun.`)], allowedMentions: { repliedUser: false } });
      } else if (tries >= 8) {
        collector.stop('lose');
      } else {
        void m.reply({ content: `${n < target ? '⬆️ Daha büyük' : '⬇️ Daha küçük'} (kalan hak: ${8 - tries})`, allowedMentions: { repliedUser: false } });
      }
    });
    collector.on('end', (_c, reason) => {
      if (reason !== 'win') void channel.send({ embeds: [embed(Colors.error, `Kaybettin! Sayı **${target}** idi.`)] }).catch(() => null);
    });
  },
};

const WORDS = ['discord', 'klavye', 'bilgisayar', 'programlama', 'istanbul', 'ankara', 'kütüphane', 'çikolata', 'telefon', 'internet', 'uzay', 'gezegen', 'sunucu', 'robot', 'yazılım', 'müzik', 'futbol', 'kahve', 'deniz', 'orman'];

const adamasmaca: Command = {
  category: 'Eğlence',
  aliases: ['hangman'],
  data: new SlashCommandBuilder().setName('adamasmaca').setDescription('Adam asmaca: herkes kanala tek harf yazarak kelimeyi bulmaya çalışır.').setDMPermission(false),
  async execute(i) {
    const word = pickOne(WORDS);
    const found = new Set<string>();
    const wrong = new Set<string>();
    const MAX = 6;
    const view = (note = '') => embed(Colors.primary, `\`${[...word].map((c) => (found.has(c) ? c : '_')).join(' ')}\`\n\n❤️ Kalan hak: **${MAX - wrong.size}**\n❌ Yanlışlar: ${[...wrong].join(' ') || '—'}\n${note}`, '🪢 Adam Asmaca');
    await i.reply({ embeds: [view('Kanala tek harf yaz!')] });

    const channel = i.channel as TextChannel;
    const collector = channel.createMessageCollector({ filter: (m) => !m.author.bot && [...m.content.trim()].length === 1 && /\p{L}/u.test(m.content), idle: 60_000 });
    collector.on('collect', async (m) => {
      const letter = m.content.trim().toLocaleLowerCase('tr');
      if (found.has(letter) || wrong.has(letter)) return;
      if (word.includes(letter)) {
        found.add(letter);
        await m.react('✅').catch(() => null);
      } else {
        wrong.add(letter);
        await m.react('❌').catch(() => null);
      }
      const won = [...word].every((c) => found.has(c));
      if (won || wrong.size >= MAX) {
        collector.stop('done');
        await i.editReply({ embeds: [embed(won ? Colors.success : Colors.error, won ? `🎉 Bildiniz! Kelime: **${word}**` : `💀 Kaybettiniz! Kelime: **${word}**`)] }).catch(() => null);
      } else {
        await i.editReply({ embeds: [view()] }).catch(() => null);
      }
    });
    collector.on('end', (_c, reason) => {
      if (reason !== 'done') void i.editReply({ embeds: [embed(Colors.warn, `⌛ Süre doldu. Kelime: **${word}**`)] }).catch(() => null);
    });
  },
};

const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const rulet: Command = {
  category: 'Eğlence',
  aliases: ['roulette'],
  data: new SlashCommandBuilder()
    .setName('rulet')
    .setDescription('Animasyonlu rulet: kırmızı/siyah x2, yeşil (0) x14.')
    .addStringOption((o) => o.setName('renk').setDescription('Rengin').setRequired(true).addChoices({ name: 'Kırmızı', value: 'kirmizi' }, { name: 'Siyah', value: 'siyah' }, { name: 'Yeşil', value: 'yesil' }))
    .addIntegerOption((o) => o.setName('bahis').setDescription('Bahis').setMinValue(1).setRequired(true))
    .setDMPermission(false),
  async execute(i) {
    const pick = i.options.getString('renk', true);
    const bet = i.options.getInteger('bahis', true);
    const u = getUser(i.guildId!, i.user.id);
    if (u.balance < bet) return i.reply({ embeds: [err('Yeterli bakiyen yok.')], ephemeral: true });

    const colorOf = (n: number) => (n === 0 ? 'yesil' : REDS.has(n) ? 'kirmizi' : 'siyah');
    const dot = (c: string) => (c === 'yesil' ? '🟢' : c === 'kirmizi' ? '🔴' : '⚫');

    await i.reply({ embeds: [embed(Colors.primary, `${emoji('spin')} Top dönüyor...`, '🎡 Rulet')] });
    for (let f = 0; f < 3; f++) {
      await sleep(700);
      const n = rand(0, 36);
      await i.editReply({ embeds: [embed(Colors.primary, `${emoji('spin')} ${dot(colorOf(n))} **${n}**`, '🎡 Rulet')] });
    }
    await sleep(800);

    const n = rand(0, 36);
    const res = colorOf(n);
    const mult = res !== pick ? 0 : pick === 'yesil' ? 14 : 2;
    u.balance += mult ? bet * (mult - 1) : -bet;
    touch();
    return i.editReply({
      embeds: [embed(mult ? Colors.success : Colors.error, `${dot(res)} **${n}** geldi!\n${mult ? `🎉 **+${bet * (mult - 1)}** ${config.currency} (x${mult})` : `💸 **-${bet}** ${config.currency}`}\nBakiye: ${u.balance}`, '🎡 Rulet')],
    });
  },
};

export default [sayitahmin, adamasmaca, rulet];
