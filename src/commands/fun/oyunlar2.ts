import type { TextChannel } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import { pickOne, rand } from '../../utils/cooldown';
import { Colors, embed, info } from '../../utils/embed';
import { makeCommand } from '../../utils/factory';
import { seeded, today } from '../../utils/seed';

const norm = (s: string) => s.trim().toLocaleLowerCase('tr').replace(/[.,!?]/g, '');

const RIDDLES: { q: string; a: string[] }[] = [
  { q: 'Ne kadar çok alırsan o kadar büyür. Nedir?', a: ['çukur', 'cukur'] },
  { q: 'Elsiz ayaksız kapı açar. Nedir?', a: ['rüzgar', 'rüzgâr', 'ruzgar'] },
  { q: 'Dişi var ama ısırmaz. Nedir?', a: ['tarak'] },
  { q: 'Kolu var ama bacağı yok; çalışır ama yorulmaz, zamanı gösterir. Nedir?', a: ['saat'] },
  { q: 'Herkesin sahip olduğu ama kimsenin veremediği şey nedir?', a: ['isim', 'ad'] },
];

const SENTENCES = [
  'Hızlı kahverengi tilki tembel köpeğin üzerinden atladı',
  'Yarın sabah erkenden yola çıkıp denize gideceğiz',
  'Bilgisayar başında geçen uzun saatler gözlerimi yordu',
  'Discord sunucusunda arkadaşlarımla oyun oynamayı seviyorum',
  'Güzel bir kitap okurken zamanın nasıl geçtiğini anlamadım',
];

const SIGNS = ['koç', 'boğa', 'ikizler', 'yengeç', 'aslan', 'başak', 'terazi', 'akrep', 'yay', 'oğlak', 'kova', 'balık'];
const HOROSCOPE = [
  'Bugün iletişimin çok güçlü, açık sözlü ol.',
  'Beklenmedik bir fırsat kapını çalabilir, hazırlıklı ol.',
  'Enerjini toparlamak için kendine biraz zaman ayır.',
  'Eski bir arkadaşından güzel bir haber alabilirsin.',
  'Bugün finansal kararlarda acele etme.',
  'Yaratıcılığın tavan yapıyor, fikirlerini paylaş.',
];

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const RANKS = ['As', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Vale', 'Kız', 'Papaz'];

/** Kanalda ilk doğru cevabı veren kazanır. */
function firstCorrect(channel: TextChannel, check: (content: string) => boolean, ms: number) {
  return channel.awaitMessages({ filter: (m) => !m.author.bot && check(m.content), max: 1, time: ms }).then((c) => c.first() ?? null);
}

export default [
  makeCommand({
    name: 'kartcek',
    desc: 'Desteden rastgele kart çeker.',
    category: 'Eğlence',
    aliases: ['draw'],
    guildOnly: false,
    options: (b) => b.addIntegerOption((o) => o.setName('adet').setDescription('1-5').setMinValue(1).setMaxValue(5)),
    run: async (i) => {
      const cards = Array.from({ length: i.options.getInteger('adet') ?? 1 }, () => `**${pickOne(SUITS)} ${pickOne(RANKS)}**`);
      return i.reply({ embeds: [info(cards.join('  •  '), '🃏 Çekilen Kartlar')] });
    },
  }),
  makeCommand({
    name: 'bilmece',
    desc: 'Bilmece sorar; ilk doğru cevap veren kazanır (30 sn).',
    category: 'Eğlence',
    run: async (i) => {
      const r = pickOne(RIDDLES);
      await i.reply({ embeds: [embed(Colors.primary, `${r.q}\n\n⏱️ 30 saniyen var, cevabı sohbete yaz!`, '🧩 Bilmece')] });
      const win = await firstCorrect(i.channel as TextChannel, (c) => r.a.includes(norm(c)), 30_000);
      return (i.channel as TextChannel).send({ embeds: [embed(win ? Colors.success : Colors.warn, win ? `🎉 ${win.author} bildi! Cevap: **${r.a[0]}**` : `⌛ Süre doldu. Cevap: **${r.a[0]}**`)] });
    },
  }),
  makeCommand({
    name: 'matematik',
    desc: 'Hızlı işlem sorusu; ilk doğru cevap veren 50 para kazanır.',
    category: 'Eğlence',
    aliases: ['math'],
    run: async (i) => {
      const a = rand(2, 30), b = rand(2, 30), op = pickOne(['+', '-', '×']);
      const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
      await i.reply({ embeds: [embed(Colors.primary, `**${a} ${op} ${b} = ?**\n⏱️ 20 saniye`, '🧮 Hızlı Matematik')] });
      const win = await firstCorrect(i.channel as TextChannel, (c) => c.trim() === String(answer), 20_000);
      if (win) {
        getUser(i.guildId!, win.author.id).balance += 50;
        touch();
      }
      return (i.channel as TextChannel).send({ embeds: [embed(win ? Colors.success : Colors.warn, win ? `🎉 ${win.author} doğru bildi! **+50** ${config.currency}\nCevap: **${answer}**` : `⌛ Süre doldu. Cevap: **${answer}**`)] });
    },
  }),
  makeCommand({
    name: 'hizliyazi',
    desc: 'Cümleyi ilk ve doğru yazan kazanır.',
    category: 'Eğlence',
    aliases: ['typerace'],
    run: async (i) => {
      const sentence = pickOne(SENTENCES);
      await i.reply({ embeds: [embed(Colors.primary, `Aşağıdaki cümleyi **aynen** yaz:\n\n\`${sentence}\``, '⌨️ Hızlı Yazı')] });
      const start = Date.now();
      const win = await firstCorrect(i.channel as TextChannel, (c) => norm(c) === norm(sentence), 30_000);
      const sec = (Date.now() - start) / 1000;
      return (i.channel as TextChannel).send({
        embeds: [embed(win ? Colors.success : Colors.warn, win ? `🏁 ${win.author} kazandı! **${sec.toFixed(1)} sn** • ~${Math.round((sentence.split(' ').length / sec) * 60)} kelime/dk` : '⌛ Kimse yazamadı.')],
      });
    },
  }),
  makeCommand({
    name: 'kim',
    desc: 'Soruya uyan rastgele bir üye seçer. Örn: kim en tembel',
    category: 'Eğlence',
    options: (b) => b.addStringOption((o) => o.setName('soru').setDescription('Kim ...?').setRequired(true).setMaxLength(100)),
    run: async (i) => {
      await i.guild!.members.fetch();
      const pick = pickOne([...i.guild!.members.cache.filter((m) => !m.user.bot).values()]);
      return i.reply({ embeds: [info(`**Kim ${i.options.getString('soru', true)}?**\n\n🎯 ${pick}`, 'Seçim')], allowedMentions: { parse: [] } });
    },
  }),
  makeCommand({
    name: 'sans',
    desc: 'Bugünkü şans durumunu gösterir (günde bir değişir).',
    category: 'Eğlence',
    aliases: ['luck'],
    run: async (i) => {
      const r = seeded(`${i.user.id}:${today()}`);
      const luck = Math.floor(r() * 101);
      const colors = ['kırmızı', 'mavi', 'yeşil', 'sarı', 'mor', 'turuncu', 'siyah', 'beyaz'];
      return i.reply({ embeds: [info(`🍀 Şans: **%${luck}**\n🔢 Şanslı sayı: **${Math.floor(r() * 99) + 1}**\n🎨 Şanslı renk: **${colors[Math.floor(r() * colors.length)]}**`, `${i.user.username} • Bugün`)] });
    },
  }),
  makeCommand({
    name: 'burc',
    desc: 'Günlük burç yorumu (eğlence amaçlı).',
    category: 'Eğlence',
    aliases: ['horoscope'],
    guildOnly: false,
    options: (b) => b.addStringOption((o) => o.setName('burc').setDescription('Burcun').setRequired(true).addChoices(...SIGNS.map((s) => ({ name: s, value: s })))),
    run: async (i) => {
      const sign = i.options.getString('burc', true);
      const r = seeded(`${sign}:${today()}`);
      const pct = () => Math.floor(r() * 61) + 40;
      return i.reply({ embeds: [info(`${HOROSCOPE[Math.floor(r() * HOROSCOPE.length)]}\n\n❤️ Aşk: **%${pct()}**\n💰 Para: **%${pct()}**\n💪 Sağlık: **%${pct()}**`, `♈ ${sign.charAt(0).toLocaleUpperCase('tr')}${sign.slice(1)} Burcu`)] });
    },
  }),
];
