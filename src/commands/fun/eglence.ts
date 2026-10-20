import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors, embed, err, info } from '../../utils/embed';

const JOKES = [
  'Temel neden bilgisayar almış? Çünkü mouse\'u çok sevmiş.',
  'Adamın biri doktora gitmiş: "Doktor bey, unutkanlığım var." Doktor: "Ne zamandan beri?" Adam: "Ne zamandan beri ne?"',
  'Dün gece rüyamda kodlama yapıyordum, sabah kalktım hâlâ derleniyordu.',
  'Bilgisayar ile insan arasındaki fark: Biri hatayı verir, diğeri hatayı başkasına yıkar.',
  'Kahve ile kod arasındaki ilişki: İkisi de olmadan sabah başlamaz.',
  'Neden programcılar karanlık modu sever? Çünkü ışık bug çeker.',
  'Matematik kitabı neden üzgün? Çok problemi var.',
  'Tembel adam merdivenleri neden sevmez? Çünkü her adımda bir kat yükseliyor.',
];

const ALPHA: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };

const command: Command = {
  category: 'Eğlence',
  aliases: ['fun'],
  data: new SlashCommandBuilder()
    .setName('eglence')
    .setDescription('Küçük eğlence araçları.')
    .addSubcommand((s) => s.setName('espri').setDescription('Rastgele espri.'))
    .addSubcommand((s) => s.setName('tersyaz').setDescription('Yazıyı tersten yazar.').addStringOption((o) => o.setName('metin').setDescription('Metin').setRequired(true).setMaxLength(500)))
    .addSubcommand((s) => s.setName('alayci').setDescription('aLaYcI yazı çevirici.').addStringOption((o) => o.setName('metin').setDescription('Metin').setRequired(true).setMaxLength(500)))
    .addSubcommand((s) => s.setName('emojiyaz').setDescription('Yazıyı harf emojilerine çevirir.').addStringOption((o) => o.setName('metin').setDescription('Metin').setRequired(true).setMaxLength(100)))
    .addSubcommand((s) => s.setName('sec').setDescription('Seçeneklerden birini seçer. Biçim: a | b | c').addStringOption((o) => o.setName('secenekler').setDescription('a | b | c').setRequired(true).setMaxLength(500)))
    .addSubcommand((s) =>
      s
        .setName('ship')
        .setDescription('İki kişinin uyumunu ölçer.')
        .addUserOption((o) => o.setName('birinci').setDescription('Birinci kişi').setRequired(true))
        .addUserOption((o) => o.setName('ikinci').setDescription('İkinci kişi (boşsa sen)')),
    ),
  async execute(i) {
    const mention = { allowedMentions: { parse: [] as never[] } };
    switch (i.options.getSubcommand()) {
      case 'espri':
        return i.reply({ embeds: [info(JOKES[Math.floor(Math.random() * JOKES.length)], '😂 Espri')] });
      case 'tersyaz':
        return i.reply({ content: [...i.options.getString('metin', true)].reverse().join(''), ...mention });
      case 'alayci': {
        let n = 0;
        const text = [...i.options.getString('metin', true)].map((c) => (/\p{L}/u.test(c) ? (n++ % 2 ? c.toLocaleUpperCase('tr') : c.toLocaleLowerCase('tr')) : c)).join('');
        return i.reply({ content: text, ...mention });
      }
      case 'emojiyaz': {
        const out = [...i.options.getString('metin', true).toLowerCase()]
          .map((c) => {
            const ch = ALPHA[c] ?? c;
            return /[a-z]/.test(ch) ? String.fromCodePoint(0x1f1e6 + ch.charCodeAt(0) - 97) + '​' : /\d/.test(ch) ? `${ch}️⃣` : ch === ' ' ? '   ' : ch;
          })
          .join('');
        return i.reply({ content: out || '—', ...mention });
      }
      case 'sec': {
        const items = i.options.getString('secenekler', true).split(/\||,/).map((s) => s.trim()).filter(Boolean);
        if (items.length < 2) return i.reply({ embeds: [err('En az 2 seçenek gir: `a | b | c`')], ephemeral: true });
        return i.reply({ embeds: [info(`**${items[Math.floor(Math.random() * items.length)]}**`, '🎯 Seçimim')] });
      }
      default: {
        const a = i.options.getUser('birinci', true);
        const b = i.options.getUser('ikinci') ?? i.user;
        // Sıradan bağımsız, aynı çift için hep aynı sonuç
        const seed = [a.id, b.id].sort().join('');
        let h = 0;
        for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 101;
        const bar = '❤️'.repeat(Math.round(h / 10)) + '🖤'.repeat(10 - Math.round(h / 10));
        return i.reply({ embeds: [embed(h > 60 ? Colors.success : h > 30 ? Colors.warn : Colors.error, `${a} 💘 ${b}\n\n${bar}\n**%${h}** uyum`, 'Aşk Ölçer')], ...mention });
      }
    }
  },
};

export default command;
