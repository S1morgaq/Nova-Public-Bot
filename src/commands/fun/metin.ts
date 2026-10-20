import crypto from 'node:crypto';
import { err, info } from '../../utils/embed';
import { makeCommand } from '../../utils/factory';
import { rand } from '../../utils/cooldown';

const NOMENTION = { allowedMentions: { parse: [] as never[] } };
const cut = (s: string, n = 1900) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const text = (o: import('discord.js').SlashCommandStringOption, desc = 'Metin') => o.setName('metin').setDescription(desc).setRequired(true).setMaxLength(1000);

const MORSE: Record<string, string> = {
  a: '.-', b: '-...', c: '-.-.', d: '-..', e: '.', f: '..-.', g: '--.', h: '....', i: '..', j: '.---', k: '-.-', l: '.-..', m: '--', n: '-.', o: '---', p: '.--.', q: '--.-', r: '.-.', s: '...', t: '-', u: '..-', v: '...-', w: '.--', x: '-..-', y: '-.--', z: '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k]));
const TR_ASCII: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u' };

const encodeDecode = (name: string, desc: string, enc: (s: string) => string, dec: (s: string) => string) =>
  makeCommand({
    name,
    desc,
    category: 'Metin',
    guildOnly: false,
    options: (b) => {
      b.addSubcommand((s) => s.setName('kodla').setDescription('Metni kodlar.').addStringOption((o) => text(o)));
      b.addSubcommand((s) => s.setName('coz').setDescription('Kodu çözer.').addStringOption((o) => text(o, 'Kod')));
    },
    run: async (i) => {
      const input = i.options.getString('metin', true);
      try {
        const out = i.options.getSubcommand() === 'kodla' ? enc(input) : dec(input);
        return i.reply({ content: `\`\`\`\n${cut(out, 1800)}\n\`\`\``, ...NOMENTION });
      } catch {
        return i.reply({ embeds: [err('Bu metin çözülemedi, geçerli bir kod mu?')], ephemeral: true });
      }
    },
  });

export default [
  encodeDecode('base64', 'Base64 kodla / çöz.', (s) => Buffer.from(s, 'utf8').toString('base64'), (s) => {
    const out = Buffer.from(s, 'base64').toString('utf8');
    if (!out || out.includes('�')) throw new Error('geçersiz');
    return out;
  }),
  encodeDecode(
    'mors',
    'Mors alfabesine çevir / çöz (harfleri / ile ayır).',
    (s) => [...s.toLowerCase()].map((c) => (c === ' ' ? '/' : MORSE[TR_ASCII[c] ?? c] ?? '')).filter(Boolean).join(' '),
    (s) => s.trim().split(/\s+/).map((c) => (c === '/' ? ' ' : MORSE_REV[c] ?? '?')).join(''),
  ),
  encodeDecode(
    'binary',
    'İkili (0/1) sisteme çevir / çöz.',
    (s) => [...Buffer.from(s, 'utf8')].map((b) => b.toString(2).padStart(8, '0')).join(' '),
    (s) => {
      const bytes = s.trim().split(/\s+/).map((b) => parseInt(b, 2));
      if (bytes.some((n) => Number.isNaN(n) || n > 255)) throw new Error('geçersiz');
      return Buffer.from(bytes).toString('utf8');
    },
  ),
  makeCommand({
    name: 'hash',
    desc: 'Metnin özet (hash) değerini hesaplar.',
    category: 'Metin',
    guildOnly: false,
    options: (b) =>
      b
        .addStringOption((o) => o.setName('algoritma').setDescription('Algoritma').setRequired(true).addChoices({ name: 'md5', value: 'md5' }, { name: 'sha1', value: 'sha1' }, { name: 'sha256', value: 'sha256' }, { name: 'sha512', value: 'sha512' }))
        .addStringOption((o) => text(o)),
    run: async (i) => i.reply({ content: `\`${i.options.getString('algoritma', true)}\`\n\`\`\`${crypto.createHash(i.options.getString('algoritma', true)).update(i.options.getString('metin', true)).digest('hex')}\`\`\``, ...NOMENTION }),
  }),
  makeCommand({
    name: 'uuid',
    desc: 'Rastgele bir UUID üretir.',
    category: 'Metin',
    guildOnly: false,
    run: async (i) => i.reply({ content: `\`${crypto.randomUUID()}\`` }),
  }),
  makeCommand({
    name: 'sifreolustur',
    desc: 'Güçlü rastgele şifre üretir ve özelden gönderir.',
    category: 'Metin',
    aliases: ['password', 'sifre'],
    options: (b) => b.addIntegerOption((o) => o.setName('uzunluk').setDescription('8-64 (varsayılan 16)').setMinValue(8).setMaxValue(64)),
    run: async (i) => {
      const chars = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*?';
      const pass = Array.from(crypto.randomBytes(i.options.getInteger('uzunluk') ?? 16), (b) => chars[b % chars.length]).join('');
      const sent = await i.user.send(`🔑 Şifren:\n||\`${pass}\`||\nBunu hiçbir yerde paylaşma.`).then(() => true).catch(() => false);
      return i.reply({ embeds: [sent ? info('Şifreni özelden gönderdim. 📬') : err('Özel mesajın kapalı, gönderemedim.')] });
    },
  }),
  makeCommand({
    name: 'rastgele',
    desc: 'İki sayı arasında rastgele sayı seçer.',
    category: 'Metin',
    aliases: ['random', 'rnd'],
    guildOnly: false,
    options: (b) => b.addIntegerOption((o) => o.setName('en_az').setDescription('En küçük').setRequired(true)).addIntegerOption((o) => o.setName('en_cok').setDescription('En büyük').setRequired(true)),
    run: async (i) => {
      const a = i.options.getInteger('en_az', true);
      const b = i.options.getInteger('en_cok', true);
      return i.reply({ embeds: [info(`🎲 **${rand(Math.min(a, b), Math.max(a, b))}**`, `${Math.min(a, b)} – ${Math.max(a, b)}`)] });
    },
  }),
  makeCommand({
    name: 'harfsay',
    desc: 'Metindeki harf, kelime ve satır sayısını verir.',
    category: 'Metin',
    guildOnly: false,
    options: (b) => b.addStringOption((o) => text(o)),
    run: async (i) => {
      const s = i.options.getString('metin', true);
      return i.reply({ embeds: [info(`**Karakter:** ${s.length}\n**Harf:** ${(s.match(/\p{L}/gu) ?? []).length}\n**Rakam:** ${(s.match(/\d/g) ?? []).length}\n**Kelime:** ${s.trim().split(/\s+/).filter(Boolean).length}\n**Satır:** ${s.split('\n').length}`, 'Metin Analizi')] });
    },
  }),
  makeCommand({
    name: 'buyukharf',
    desc: 'Metni BÜYÜK HARFE çevirir (Türkçe uyumlu).',
    category: 'Metin',
    guildOnly: false,
    options: (b) => b.addStringOption((o) => text(o)),
    run: async (i) => i.reply({ content: cut(i.options.getString('metin', true).toLocaleUpperCase('tr')), ...NOMENTION }),
  }),
  makeCommand({
    name: 'kucukharf',
    desc: 'Metni küçük harfe çevirir (Türkçe uyumlu).',
    category: 'Metin',
    guildOnly: false,
    options: (b) => b.addStringOption((o) => text(o)),
    run: async (i) => i.reply({ content: cut(i.options.getString('metin', true).toLocaleLowerCase('tr')), ...NOMENTION }),
  }),
  makeCommand({
    name: 'baslik',
    desc: 'Her kelimenin ilk harfini büyütür.',
    category: 'Metin',
    guildOnly: false,
    options: (b) => b.addStringOption((o) => text(o)),
    run: async (i) =>
      i.reply({
        content: cut(i.options.getString('metin', true).toLocaleLowerCase('tr').replace(/(^|\s)(\p{L})/gu, (_m, sp: string, c: string) => sp + c.toLocaleUpperCase('tr'))),
        ...NOMENTION,
      }),
  }),
];
