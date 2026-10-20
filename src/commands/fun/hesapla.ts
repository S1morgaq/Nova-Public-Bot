import { SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { err, info } from '../../utils/embed';

/** eval kullanmadan, + - * / % ^ ve parantezleri destekleyen küçük ifade ayrıştırıcı. */
function calculate(src: string): number {
  const tokens = src.replace(/,/g, '.').match(/\d+\.?\d*|[-+*/%^()]/g);
  if (!tokens || tokens.join('').length !== src.replace(/[\s,]/g, '').length) throw new Error('geçersiz karakter');
  let p = 0;
  const peek = () => tokens[p];
  const expr = (): number => {
    let v = term();
    while (peek() === '+' || peek() === '-') v = tokens[p++] === '+' ? v + term() : v - term();
    return v;
  };
  const term = (): number => {
    let v = power();
    while (peek() === '*' || peek() === '/' || peek() === '%') {
      const op = tokens[p++];
      const r = power();
      if ((op === '/' || op === '%') && r === 0) throw new Error('sıfıra bölme');
      v = op === '*' ? v * r : op === '/' ? v / r : v % r;
    }
    return v;
  };
  const power = (): number => {
    const base = unary();
    return peek() === '^' ? (p++, Math.pow(base, power())) : base;
  };
  const unary = (): number => {
    if (peek() === '-') return p++, -unary();
    if (peek() === '+') return p++, unary();
    if (peek() === '(') {
      p++;
      const v = expr();
      if (tokens[p++] !== ')') throw new Error('parantez eksik');
      return v;
    }
    const n = Number(tokens[p++]);
    if (Number.isNaN(n)) throw new Error('beklenmeyen ifade');
    return n;
  };
  const result = expr();
  if (p !== tokens.length) throw new Error('beklenmeyen ifade');
  return result;
}

const command: Command = {
  category: 'Genel',
  aliases: ['calc', 'hesap'],
  data: new SlashCommandBuilder()
    .setName('hesapla')
    .setDescription('Matematik işlemi yapar. Örn: (12+8)*3^2')
    .addStringOption((o) => o.setName('islem').setDescription('İşlem').setRequired(true).setMaxLength(200)),
  async execute(i) {
    const q = i.options.getString('islem', true);
    try {
      const r = calculate(q);
      if (!Number.isFinite(r)) throw new Error('sonuç sonsuz');
      return i.reply({ embeds: [info(`\`${q}\`\n= **${Number(r.toPrecision(12))}**`, '🧮 Hesap Makinesi')] });
    } catch (e) {
      return i.reply({ embeds: [err(`Hesaplanamadı: ${e instanceof Error ? e.message : 'hata'}`)], ephemeral: true });
    }
  },
};

export default command;
