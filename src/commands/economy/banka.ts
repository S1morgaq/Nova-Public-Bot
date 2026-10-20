import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { cooldown, rand } from '../../utils/cooldown';
import { Colors, embed, err, formatDuration, ok } from '../../utils/embed';

const yatir: Command = {
  category: 'Ekonomi',
  aliases: ['deposit', 'dep'],
  data: new SlashCommandBuilder()
    .setName('yatir')
    .setDescription('Bankaya para yatır (soygundan korunur).')
    .addIntegerOption((o) => o.setName('miktar').setDescription('Miktar').setMinValue(1).setRequired(true))
    .setDMPermission(false),
  async execute(i) {
    const u = getUser(i.guildId!, i.user.id);
    const n = i.options.getInteger('miktar', true);
    if (u.balance < n) return i.reply({ embeds: [err('Cüzdanında bu kadar para yok.')], ephemeral: true });
    u.balance -= n;
    u.bank = (u.bank ?? 0) + n;
    touch();
    return i.reply({ embeds: [ok(`**${n}** ${config.currency} yatırıldı. Banka: ${u.bank} • Cüzdan: ${u.balance}`)] });
  },
};

const cek: Command = {
  category: 'Ekonomi',
  aliases: ['withdraw', 'wd'],
  data: new SlashCommandBuilder()
    .setName('cek')
    .setDescription('Bankadan para çek.')
    .addIntegerOption((o) => o.setName('miktar').setDescription('Miktar').setMinValue(1).setRequired(true))
    .setDMPermission(false),
  async execute(i) {
    const u = getUser(i.guildId!, i.user.id);
    const n = i.options.getInteger('miktar', true);
    if ((u.bank ?? 0) < n) return i.reply({ embeds: [err('Bankanda bu kadar para yok.')], ephemeral: true });
    u.bank! -= n;
    u.balance += n;
    touch();
    return i.reply({ embeds: [ok(`**${n}** ${config.currency} çekildi. Banka: ${u.bank} • Cüzdan: ${u.balance}`)] });
  },
};

const soygun: Command = {
  category: 'Ekonomi',
  aliases: ['rob'],
  data: new SlashCommandBuilder()
    .setName('soygun')
    .setDescription('Bir üyenin cüzdanını soymayı dene. (1 saat bekleme, %40 şans)')
    .addUserOption((o) => o.setName('uye').setDescription('Kurban').setRequired(true))
    .setDMPermission(false),
  async execute(i) {
    const target = i.options.getUser('uye', true);
    if (target.bot || target.id === i.user.id) return i.reply({ embeds: [err('Geçersiz hedef.')], ephemeral: true });
    const left = cooldown(i.guildId!, i.user.id, 'soygun', 3600_000, false);
    if (left > 0) return i.reply({ embeds: [err(`Polis peşinde! **${formatDuration(left)}** sonra tekrar dene.`)], ephemeral: true });

    const me = getUser(i.guildId!, i.user.id);
    const victim = getUser(i.guildId!, target.id);
    if (victim.balance < 100) return i.reply({ embeds: [err(`${target.username} soymaya değmez (cüzdanında 100'den az var).`)], ephemeral: true });
    cooldown(i.guildId!, i.user.id, 'soygun', 3600_000);

    if (Math.random() < 0.4) {
      const stolen = Math.min(1500, Math.floor(victim.balance * (rand(10, 30) / 100)));
      victim.balance -= stolen;
      me.balance += stolen;
      touch();
      return i.reply({ embeds: [embed(Colors.success, `🥷 ${i.user} → ${target} cüzdanından **${stolen}** ${config.currency} çaldı!`)], allowedMentions: { parse: [] } });
    }
    const fine = Math.min(me.balance, 200);
    me.balance -= fine;
    touch();
    return i.reply({ embeds: [embed(Colors.error, `🚨 Yakalandın! **${fine}** ${config.currency} ceza ödedin.`)] });
  },
};

export default [yatir, cek, soygun];
