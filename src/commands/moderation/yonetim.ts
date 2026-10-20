import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, type TextChannel } from 'discord.js';
import { removeWarn } from '../../db';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const sunucukilit: Command = {
  category: 'Moderasyon',
  aliases: ['lockdown'],
  data: new SlashCommandBuilder()
    .setName('sunucukilit')
    .setDescription('Tüm metin kanallarını herkese yazmaya kapatır / açar (acil durum).')
    .addStringOption((o) => o.setName('islem').setDescription('Ne yapılsın?').setRequired(true).addChoices({ name: 'Kilitle', value: 'kapat' }, { name: 'Kilidi aç', value: 'ac' }))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(i) {
    const lock = i.options.getString('islem', true) === 'kapat';
    await i.deferReply();
    let n = 0;
    for (const c of i.guild!.channels.cache.values()) {
      if (c.type !== ChannelType.GuildText) continue;
      const done = await c.permissionOverwrites.edit(i.guildId!, { SendMessages: lock ? false : null }, { reason: `${i.user.tag}: sunucukilit` }).then(() => true).catch(() => false);
      if (done) n++;
    }
    return i.editReply({ embeds: [ok(`${lock ? '🔒 Kilitlendi' : '🔓 Kilit açıldı'}: ${n} kanal.`)] });
  },
};

const nuke: Command = {
  category: 'Moderasyon',
  aliases: ['sifirla'],
  data: new SlashCommandBuilder().setName('nuke').setDescription('Kanalı klonlayıp eskisini silerek tüm mesajları sıfırlar.').setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels).setDMPermission(false),
  async execute(i) {
    const old = i.channel as TextChannel;
    if (old.type !== ChannelType.GuildText) return i.reply({ embeds: [err('Sadece metin kanallarında kullanılır.')], ephemeral: true });
    const fresh = await old.clone({ reason: `${i.user.tag}: nuke` });
    await fresh.setPosition(old.position);
    await old.delete().catch(() => null);
    await fresh.send({ embeds: [ok(`💥 Kanal ${i.user} tarafından sıfırlandı.`)] }).catch(() => null);
    // Eski kanal silindiği için yanıt başarısız olabilir
    await i.reply({ embeds: [ok(`Kanal sıfırlandı: ${fresh}`)], ephemeral: true }).catch(() => null);
  },
};

const uyarisil: Command = {
  category: 'Moderasyon',
  aliases: ['delwarn'],
  data: new SlashCommandBuilder()
    .setName('uyarisil')
    .setDescription('Tek bir uyarıyı ID ile siler (ID için /uyarilar).')
    .addIntegerOption((o) => o.setName('id').setDescription('Uyarı ID').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false),
  async execute(i) {
    const done = removeWarn(i.guildId!, i.options.getInteger('id', true));
    return i.reply({ embeds: [done ? ok('Uyarı silindi.') : err('Bu ID\'ye ait uyarı bulunamadı.')] });
  },
};

const banliste: Command = {
  category: 'Moderasyon',
  aliases: ['bans'],
  data: new SlashCommandBuilder().setName('banliste').setDescription('Son 25 yasaklı kullanıcıyı listeler.').setDefaultMemberPermissions(PermissionFlagsBits.BanMembers).setDMPermission(false),
  async execute(i) {
    const bans = await i.guild!.bans.fetch({ limit: 25 }).catch(() => null);
    if (!bans) return i.reply({ embeds: [err('Yasak listesi alınamadı.')], ephemeral: true });
    const lines = bans.map((b) => `\`${b.user.id}\` **${b.user.tag}** — ${(b.reason ?? 'sebep yok').slice(0, 60)}`);
    return i.reply({ embeds: [info(lines.join('\n') || 'Yasaklı kimse yok.', `🔨 Yasaklılar (${bans.size})`)] });
  },
};

const rololustur: Command = {
  category: 'Moderasyon',
  aliases: ['createrole'],
  data: new SlashCommandBuilder()
    .setName('rololustur')
    .setDescription('Yeni rol oluşturur.')
    .addStringOption((o) => o.setName('renk').setDescription('Hex renk, örn. #ff0000').setRequired(true).setMaxLength(7))
    .addStringOption((o) => o.setName('ad').setDescription('Rol adı').setRequired(true).setMaxLength(100))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),
  async execute(i) {
    const color = i.options.getString('renk', true).replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(color)) return i.reply({ embeds: [err('Geçerli bir hex renk gir (örn. #ff0000).')], ephemeral: true });
    const role = await i.guild!.roles.create({ name: i.options.getString('ad', true), color: parseInt(color, 16), reason: `${i.user.tag}: rololustur` });
    return i.reply({ embeds: [ok(`Rol oluşturuldu: ${role}`)] });
  },
};

export default [sunucukilit, nuke, uyarisil, banliste, rololustur];
