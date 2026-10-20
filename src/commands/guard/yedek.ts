import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, type Guild, type GuildChannelCreateOptions, type NonThreadGuildBasedChannel, type OverwriteResolvable } from 'discord.js';
import { backups, type Backup } from '../../db';
import type { Command } from '../../types';
import { err, info, ok } from '../../utils/embed';

const EVERYONE = '@everyone';

export function snapshot(guild: Guild): Backup {
  const roleName = (id: string) => (id === guild.id ? EVERYONE : guild.roles.cache.get(id)?.name ?? null);
  return {
    at: Date.now(),
    roles: guild.roles.cache
      .filter((r) => !r.managed && r.id !== guild.id)
      .sort((a, b) => a.position - b.position)
      .map((r) => ({ name: r.name, color: r.color, hoist: r.hoist, mentionable: r.mentionable, permissions: r.permissions.bitfield.toString() })),
    channels: guild.channels.cache
      .filter((c): c is NonThreadGuildBasedChannel => !c.isThread())
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .map((c) => ({
        name: c.name,
        type: c.type,
        parent: c.parent?.name ?? null,
        topic: 'topic' in c ? c.topic : null,
        nsfw: 'nsfw' in c ? c.nsfw : false,
        userLimit: 'userLimit' in c ? c.userLimit : 0,
        bitrate: 'bitrate' in c ? c.bitrate : 0,
        position: c.rawPosition,
        overwrites: c.permissionOverwrites.cache
          .filter((o) => o.type === 0 && roleName(o.id))
          .map((o) => ({ role: roleName(o.id)!, type: o.type, allow: o.allow.bitfield.toString(), deny: o.deny.bitfield.toString() })),
      })),
  };
}

async function restore(guild: Guild, b: Backup): Promise<{ roles: number; channels: number }> {
  let roles = 0;
  let channels = 0;

  for (const r of b.roles) {
    if (guild.roles.cache.some((x) => x.name === r.name)) continue;
    const made = await guild.roles.create({ name: r.name, color: r.color, hoist: r.hoist, mentionable: r.mentionable, permissions: BigInt(r.permissions), reason: 'Yedekten geri yükleme' }).catch(() => null);
    if (made) roles++;
  }

  const overwritesOf = (list: Backup['channels'][number]['overwrites']): OverwriteResolvable[] =>
    list.flatMap((o) => {
      const id = o.role === EVERYONE ? guild.id : guild.roles.cache.find((r) => r.name === o.role)?.id;
      return id ? [{ id, type: 0, allow: BigInt(o.allow), deny: BigInt(o.deny) } as OverwriteResolvable] : [];
    });

  const ordered = [...b.channels.filter((c) => c.type === ChannelType.GuildCategory), ...b.channels.filter((c) => c.type !== ChannelType.GuildCategory)];
  for (const c of ordered) {
    if (guild.channels.cache.some((x) => x.name === c.name && x.type === c.type)) continue;
    const parent = c.parent ? guild.channels.cache.find((x) => x.type === ChannelType.GuildCategory && x.name === c.parent)?.id : undefined;
    const opts = {
      name: c.name,
      type: c.type,
      parent,
      topic: c.topic ?? undefined,
      nsfw: c.nsfw,
      userLimit: c.userLimit || undefined,
      bitrate: c.bitrate ? Math.min(c.bitrate, guild.maximumBitrate) : undefined,
      permissionOverwrites: overwritesOf(c.overwrites),
      reason: 'Yedekten geri yükleme',
    } as GuildChannelCreateOptions;
    if (await guild.channels.create(opts).catch(() => null)) channels++;
  }
  return { roles, channels };
}

const command: Command = {
  category: 'Koruma',
  aliases: ['backup'],
  data: new SlashCommandBuilder()
    .setName('yedek')
    .setDescription('Rol ve kanal yapısını yedekle / eksikleri geri yükle. Sadece sunucu sahibi.')
    .addSubcommand((s) => s.setName('al').setDescription('Mevcut rol ve kanalların yedeğini alır.'))
    .addSubcommand((s) => s.setName('yukle').setDescription('Yedekte olup sunucuda eksik olan rol/kanalları oluşturur.').addBooleanOption((o) => o.setName('onay').setDescription('Evet = onaylıyorum').setRequired(true)))
    .addSubcommand((s) => s.setName('bilgi').setDescription('Son yedek hakkında bilgi verir.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(i) {
    if (i.user.id !== i.guild!.ownerId) return i.reply({ embeds: [err('Yedek işlemlerini sadece sunucu sahibi yapabilir.')], ephemeral: true });
    const sub = i.options.getSubcommand();
    const current = backups.get(i.guildId!);

    if (sub === 'al') {
      const b = snapshot(i.guild!);
      backups.set(i.guildId!, b);
      return i.reply({ embeds: [ok(`Yedek alındı: **${b.roles.length}** rol, **${b.channels.length}** kanal.`)] });
    }
    if (sub === 'bilgi') {
      return i.reply({ embeds: [info(current ? `📅 <t:${Math.floor(current.at / 1000)}:F>\n**${current.roles.length}** rol • **${current.channels.length}** kanal` : 'Henüz yedek yok. `/yedek al` ile oluştur.', '💾 Yedek')] });
    }
    if (!current) return i.reply({ embeds: [err('Yedek bulunamadı.')], ephemeral: true });
    if (!i.options.getBoolean('onay', true)) return i.reply({ embeds: [err('İşlem iptal edildi.')], ephemeral: true });

    await i.reply({ embeds: [info('Geri yükleniyor, bu birkaç dakika sürebilir...')] });
    const result = await restore(i.guild!, current);
    return i.editReply({ embeds: [ok(`Geri yükleme bitti: **${result.roles}** rol, **${result.channels}** kanal oluşturuldu. (Zaten var olanlara dokunulmadı.)`)] });
  },
};

export default command;
