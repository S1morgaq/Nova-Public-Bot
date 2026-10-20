import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, touch, topUsers } from '../../db';
import type { Command } from '../../types';
import { cooldown } from '../../utils/cooldown';
import { Colors, err, formatDuration, ok } from '../../utils/embed';
import { progressBar, xpNeeded } from '../../utils/level';

const rep: Command = {
  category: 'Seviye',
  aliases: ['itibar'],
  data: new SlashCommandBuilder()
    .setName('rep')
    .setDescription('Bir üyeye itibar puanı ver. (24 saatte bir)')
    .addUserOption((o) => o.setName('uye').setDescription('Üye').setRequired(true))
    .setDMPermission(false),
  async execute(i) {
    const target = i.options.getUser('uye', true);
    if (target.bot || target.id === i.user.id) return i.reply({ embeds: [err('Geçersiz üye.')], ephemeral: true });
    const left = cooldown(i.guildId!, i.user.id, 'rep', 86400_000);
    if (left > 0) return i.reply({ embeds: [err(`Tekrar rep vermek için **${formatDuration(left)}** bekle.`)], ephemeral: true });
    const t = getUser(i.guildId!, target.id);
    t.rep = (t.rep ?? 0) + 1;
    touch();
    return i.reply({ embeds: [ok(`${target} kullanıcısına itibar verdin! Toplam: **${t.rep}** ⭐`)], allowedMentions: { parse: [] } });
  },
};

const hakkimda: Command = {
  category: 'Seviye',
  aliases: ['bio'],
  data: new SlashCommandBuilder()
    .setName('hakkimda')
    .setDescription('Profilindeki hakkımda yazısını ayarla.')
    .addStringOption((o) => o.setName('yazi').setDescription('Yazın (boş bırakırsan silinir)').setMaxLength(150))
    .setDMPermission(false),
  async execute(i) {
    const u = getUser(i.guildId!, i.user.id);
    u.bio = i.options.getString('yazi') ?? undefined;
    touch();
    return i.reply({ embeds: [ok(u.bio ? 'Hakkımda güncellendi.' : 'Hakkımda silindi.')], ephemeral: true });
  },
};

const profil: Command = {
  category: 'Seviye',
  aliases: ['profile', 'card'],
  data: new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Seviye, para, ses, itibar ve hakkımda içeren profil kartı.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye'))
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('uye') ?? i.user;
    const d = getUser(i.guildId!, user.id);
    const need = xpNeeded(d.level);
    const rank = topUsers(i.guildId!, 100_000).findIndex((u) => u.userId === user.id) + 1;
    const voice = d.voiceSeconds ?? 0;
    const e = new EmbedBuilder()
      .setColor(Colors.primary)
      .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .setDescription(d.bio ? `*${d.bio}*` : null)
      .addFields(
        { name: '📈 Seviye', value: `**${d.level}** • Sıra #${rank || '—'}\n${progressBar(d.xp, need, 10)} \`${d.xp}/${need}\``, inline: false },
        { name: '💬 Mesaj', value: String(d.messages), inline: true },
        { name: '🎙️ Ses', value: `${Math.floor(voice / 3600)} sa ${Math.floor((voice % 3600) / 60)} dk`, inline: true },
        { name: '⭐ İtibar', value: String(d.rep ?? 0), inline: true },
        { name: `${config.currency} Cüzdan`, value: String(d.balance), inline: true },
        { name: '🏦 Banka', value: String(d.bank ?? 0), inline: true },
      );
    return i.reply({ embeds: [e] });
  },
};

export default [profil, rep, hakkimda];
