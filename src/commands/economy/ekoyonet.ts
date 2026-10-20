import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, guildUserIds, resetUser, touch } from '../../db';
import type { Command } from '../../types';
import { err, ok } from '../../utils/embed';
import { xpNeeded } from '../../utils/level';

const memberOpt = (o: import('discord.js').SlashCommandUserOption) => o.setName('uye').setDescription('Üye').setRequired(true);
const amountOpt = (o: import('discord.js').SlashCommandIntegerOption) => o.setName('miktar').setDescription('Miktar').setMinValue(1).setMaxValue(1_000_000_000).setRequired(true);

const command: Command = {
  category: 'Ekonomi',
  aliases: ['ekoadmin', 'economyadmin'],
  data: new SlashCommandBuilder()
    .setName('ekoyonet')
    .setDescription('Yönetici: para, XP ve seviye ver/al/sıfırla.')
    .addSubcommand((s) => s.setName('paraver').setDescription('Üyeye para ekler.').addUserOption(memberOpt).addIntegerOption(amountOpt))
    .addSubcommand((s) => s.setName('parasil').setDescription('Üyeden para düşer.').addUserOption(memberOpt).addIntegerOption(amountOpt))
    .addSubcommand((s) => s.setName('parasifirla').setDescription('Üyenin cüzdan ve bankasını sıfırlar.').addUserOption(memberOpt))
    .addSubcommand((s) => s.setName('herkesepara').setDescription('Veritabanındaki tüm üyelere para ekler.').addIntegerOption(amountOpt))
    .addSubcommand((s) => s.setName('xpver').setDescription('Üyeye XP ekler (seviye atlar).').addUserOption(memberOpt).addIntegerOption(amountOpt))
    .addSubcommand((s) => s.setName('seviyeayarla').setDescription('Üyenin seviyesini ayarlar.').addUserOption(memberOpt).addIntegerOption((o) => o.setName('seviye').setDescription('Seviye').setMinValue(0).setMaxValue(500).setRequired(true)))
    .addSubcommand((s) => s.setName('sifirla').setDescription('Üyenin tüm verisini (seviye, para, istatistik) siler.').addUserOption(memberOpt).addBooleanOption((o) => o.setName('onay').setDescription('Evet = onaylıyorum').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(i) {
    const sub = i.options.getSubcommand();
    const gid = i.guildId!;

    if (sub === 'herkesepara') {
      const amount = i.options.getInteger('miktar', true);
      const ids = guildUserIds(gid);
      for (const id of ids) getUser(gid, id).balance += amount;
      touch();
      return i.reply({ embeds: [ok(`${ids.length} üyeye **${amount}** ${config.currency} eklendi.`)] });
    }

    const user = i.options.getUser('uye', true);
    if (user.bot) return i.reply({ embeds: [err('Botlara uygulanamaz.')], ephemeral: true });
    const d = getUser(gid, user.id);

    switch (sub) {
      case 'paraver': {
        const n = i.options.getInteger('miktar', true);
        d.balance += n;
        touch();
        return i.reply({ embeds: [ok(`${user} hesabına **${n}** ${config.currency} eklendi. Bakiye: ${d.balance}`)], allowedMentions: { parse: [] } });
      }
      case 'parasil': {
        const n = Math.min(d.balance, i.options.getInteger('miktar', true));
        d.balance -= n;
        touch();
        return i.reply({ embeds: [ok(`${user} hesabından **${n}** ${config.currency} düşüldü. Bakiye: ${d.balance}`)], allowedMentions: { parse: [] } });
      }
      case 'parasifirla':
        d.balance = 0;
        d.bank = 0;
        touch();
        return i.reply({ embeds: [ok(`${user} para bilgileri sıfırlandı.`)], allowedMentions: { parse: [] } });
      case 'xpver': {
        d.xp += i.options.getInteger('miktar', true);
        while (d.xp >= xpNeeded(d.level)) {
          d.xp -= xpNeeded(d.level);
          d.level++;
        }
        touch();
        return i.reply({ embeds: [ok(`${user} artık **seviye ${d.level}** (${d.xp} XP).`)], allowedMentions: { parse: [] } });
      }
      case 'seviyeayarla':
        d.level = i.options.getInteger('seviye', true);
        d.xp = 0;
        touch();
        return i.reply({ embeds: [ok(`${user} seviyesi **${d.level}** yapıldı.`)], allowedMentions: { parse: [] } });
      default:
        if (!i.options.getBoolean('onay', true)) return i.reply({ embeds: [err('İşlem iptal edildi.')], ephemeral: true });
        resetUser(gid, user.id);
        return i.reply({ embeds: [ok(`${user} tüm verisi silindi.`)], allowedMentions: { parse: [] } });
    }
  },
};

export default command;
