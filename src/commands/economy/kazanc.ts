import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { cooldown, pickOne, rand } from '../../utils/cooldown';
import { Colors, embed, err, formatDuration } from '../../utils/embed';

interface Earn {
  name: string;
  aliases?: string[];
  desc: string;
  cooldownMs: number;
  min: number;
  max: number;
  /** 0-1 arası başarısızlık ihtimali; başarısızsa para cezası kesilir */
  failChance?: number;
  success: string[];
  fail?: string[];
}

function make(e: Earn): Command {
  return {
    category: 'Ekonomi',
    aliases: e.aliases,
    data: new SlashCommandBuilder().setName(e.name).setDescription(e.desc).setDMPermission(false),
    async execute(i) {
      const left = cooldown(i.guildId!, i.user.id, e.name, e.cooldownMs, false);
      if (left > 0) return i.reply({ embeds: [err(`Biraz bekle! **${formatDuration(left)}** sonra tekrar dene.`)], ephemeral: true });
      cooldown(i.guildId!, i.user.id, e.name, e.cooldownMs);

      const u = getUser(i.guildId!, i.user.id);
      const amount = rand(e.min, e.max);
      if (e.failChance && Math.random() < e.failChance) {
        const fine = Math.min(u.balance, Math.ceil(amount / 2));
        u.balance -= fine;
        touch();
        return i.reply({ embeds: [embed(Colors.error, `${pickOne(e.fail ?? ['Yakalandın!'])}\n💸 **-${fine}** ${config.currency}`)] });
      }
      u.balance += amount;
      touch();
      return i.reply({ embeds: [embed(Colors.success, `${pickOne(e.success)}\n**+${amount}** ${config.currency} • Bakiye: ${u.balance}`)] });
    },
  };
}

export default [
  make({ name: 'balikci', aliases: ['fish'], desc: 'Balık tutup para kazan. (30 dk bekleme)', cooldownMs: 30 * 60_000, min: 40, max: 180, success: ['🎣 Güzel bir levrek yakaladın!', '🐟 Olta ağırlaştı, çipura çıktı!', '🦈 Vay be, köpekbalığı tuttun!'] }),
  make({ name: 'maden', aliases: ['mine'], desc: 'Madene inip değerli taş çıkar. (45 dk bekleme)', cooldownMs: 45 * 60_000, min: 80, max: 260, success: ['⛏️ Altın damarı buldun!', '💎 Elmas çıkardın!', '🪨 Demir yatağına denk geldin.'] }),
  make({ name: 'suc', aliases: ['crime'], desc: 'Riskli işlere gir: büyük kazanç ya da ceza. (1 saat bekleme)', cooldownMs: 3600_000, min: 150, max: 450, failChance: 0.4, success: ['🕶️ Planın kusursuz işledi!', '🚗 Kimse fark etmedi, sıvıştın.'], fail: ['🚨 Polise yakalandın!', '👮 Kameralara takıldın, ceza yedin!'] }),
  make({ name: 'haftalik', aliases: ['weekly'], desc: 'Haftalık ödülünü al. (7 gün bekleme)', cooldownMs: 7 * 86400_000, min: 3000, max: 5000, success: ['🎁 Haftalık ödülün geldi!'] }),
];
