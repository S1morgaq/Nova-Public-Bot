import { PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { getGuild, updateGuild } from '../../db';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const command: Command = {
  category: 'Koruma',
  aliases: ['koruma'],
  data: new SlashCommandBuilder()
    .setName('guard')
    .setDescription('Sunucu koruması (kanal/rol silme, izinsiz bot, ban/kick limiti...). Sadece sunucu sahibi.')
    .addSubcommand((s) => s.setName('durum').setDescription('Korumayı aç/kapat.').addBooleanOption((o) => o.setName('acik').setDescription('Açık mı?').setRequired(true)))
    .addSubcommand((s) =>
      s
        .setName('ceza')
        .setDescription('İhlal yapana uygulanacak ceza.')
        .addStringOption((o) => o.setName('tur').setDescription('Ceza').setRequired(true).addChoices({ name: 'Yasakla', value: 'ban' }, { name: 'At', value: 'kick' }, { name: 'Rollerini al', value: 'strip' })),
    )
    .addSubcommand((s) => s.setName('limit').setDescription('Dakikada izin verilen ban/kick sayısı.').addIntegerOption((o) => o.setName('sayi').setDescription('1-20').setMinValue(1).setMaxValue(20).setRequired(true)))
    .addSubcommand((s) => s.setName('izinver').setDescription('Üyeyi beyaz listeye ekle (korumadan muaf).').addUserOption((o) => o.setName('uye').setDescription('Üye veya bot').setRequired(true)))
    .addSubcommand((s) => s.setName('izinal').setDescription('Üyeyi beyaz listeden çıkar.').addUserOption((o) => o.setName('uye').setDescription('Üye veya bot').setRequired(true)))
    .addSubcommand((s) => s.setName('liste').setDescription('Koruma ayarlarını ve beyaz listeyi gösterir.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(i) {
    if (i.user.id !== i.guild!.ownerId) return i.reply({ embeds: [err('Koruma ayarlarını sadece sunucu sahibi değiştirebilir.')], ephemeral: true });
    const g = getGuild(i.guildId!).guard;
    const save = (patch: Partial<typeof g>) => updateGuild(i.guildId!, { guard: { ...g, ...patch } });

    switch (i.options.getSubcommand()) {
      case 'durum': {
        const on = i.options.getBoolean('acik', true);
        save({ enabled: on });
        return i.reply({ embeds: [ok(`Guard ${on ? 'açıldı' : 'kapatıldı'}.${on ? '\nBotun **Denetim Kaydını Görüntüle** ve **Yönetici** yetkisi olmalı; rolü en üstte olmalı.' : ''}`)] });
      }
      case 'ceza': {
        const tur = i.options.getString('tur', true) as typeof g.punishment;
        save({ punishment: tur });
        return i.reply({ embeds: [ok(`Ceza: **${tur}**`)] });
      }
      case 'limit': {
        const n = i.options.getInteger('sayi', true);
        save({ limit: n });
        return i.reply({ embeds: [ok(`Dakikada en fazla **${n}** ban/kick'e izin verilecek.`)] });
      }
      case 'izinver': {
        const u = i.options.getUser('uye', true);
        save({ whitelist: [...new Set([...g.whitelist, u.id])] });
        return i.reply({ embeds: [ok(`${u} beyaz listeye eklendi.`)], allowedMentions: { parse: [] } });
      }
      case 'izinal': {
        const u = i.options.getUser('uye', true);
        save({ whitelist: g.whitelist.filter((id) => id !== u.id) });
        return i.reply({ embeds: [ok(`${u} beyaz listeden çıkarıldı.`)], allowedMentions: { parse: [] } });
      }
      default:
        return i.reply({
          embeds: [info(`**Durum:** ${g.enabled ? 'Açık' : 'Kapalı'}\n**Ceza:** ${g.punishment}\n**Limit:** ${g.limit}/dk\n**Beyaz liste:** ${g.whitelist.map((id) => `<@${id}>`).join(', ') || '—'}\n\nSahip ve bu botlar her zaman muaftır.`, '🛡️ Guard')],
          allowedMentions: { parse: [] },
        });
    }
  },
};

export default command;
