import { ChannelType, PermissionFlagsBits, SlashCommandBuilder, type CategoryChannel, type Guild, type GuildBasedChannel, type OverwriteResolvable, type Role } from 'discord.js';
import { getGuild, updateGuild, type LogType } from '../../db';
import type { Command } from '../../types';
import { err, info } from '../../utils/embed';

const P = PermissionFlagsBits;

async function category(guild: Guild, name: string, overwrites: OverwriteResolvable[]): Promise<CategoryChannel> {
  const found = guild.channels.cache.find((c): c is CategoryChannel => c.type === ChannelType.GuildCategory && c.name === name);
  return found ?? guild.channels.create({ name, type: ChannelType.GuildCategory, permissionOverwrites: overwrites });
}

async function child(guild: Guild, parent: CategoryChannel, name: string, type: ChannelType.GuildText | ChannelType.GuildVoice, overwrites?: OverwriteResolvable[]): Promise<GuildBasedChannel> {
  const found = guild.channels.cache.find((c) => c.parentId === parent.id && c.name === name && c.type === type);
  return found ?? guild.channels.create({ name, type, parent: parent.id, permissionOverwrites: overwrites });
}

/** Sadece yöneticiler ve bot görebilir. */
const staffOnly = (guild: Guild): OverwriteResolvable[] => [
  { id: guild.id, deny: [P.ViewChannel] },
  { id: guild.members.me!.id, allow: [P.ViewChannel, P.SendMessages, P.EmbedLinks, P.AttachFiles, P.ManageChannels] },
];

async function setupLogs(guild: Guild): Promise<string> {
  const cat = await category(guild, '📋 SUNUCU LOGLARI', staffOnly(guild));
  const names: Record<LogType, string> = { mod: '🔨・mod-log', message: '💬・mesaj-log', voice: '🔊・ses-log', member: '👤・uye-log', guard: '🛡️・guard-log' };
  const logs: Partial<Record<LogType, string>> = {};
  for (const [type, name] of Object.entries(names) as [LogType, string][]) logs[type] = (await child(guild, cat, name, ChannelType.GuildText)).id;
  updateGuild(guild.id, { logs, logChannel: logs.mod });
  return `📋 Log kanalları kuruldu (${Object.keys(names).length}): mod, mesaj, ses, üye, guard. Sadece yöneticiler görür.`;
}

async function setupJail(guild: Guild): Promise<string> {
  let role: Role | undefined = guild.roles.cache.find((r) => r.name === 'Cezalı');
  role ??= await guild.roles.create({ name: 'Cezalı', color: 0x4b5563, permissions: [], reason: 'Kurulum: jail rolü' });

  const cat = await category(guild, '⛓️ CEZALI', [
    { id: guild.id, deny: [P.ViewChannel] },
    { id: role.id, allow: [P.ViewChannel, P.ReadMessageHistory], deny: [P.SendMessages] },
  ]);
  await child(guild, cat, '⛓️・cezali-bilgi', ChannelType.GuildText);

  // Cezalı rolü diğer tüm kanalları göremesin
  let n = 0;
  for (const c of guild.channels.cache.values()) {
    if (c.isThread() || c.id === cat.id || c.parentId === cat.id) continue;
    await c.permissionOverwrites.edit(role, { ViewChannel: false, Connect: false }, { reason: 'Kurulum: jail' }).catch(() => null);
    n++;
  }
  updateGuild(guild.id, { jailRole: role.id });
  return `⛓️ Jail kuruldu: ${role} rolü ${n} kanalda gizlendi, cezalılar sadece #cezali-bilgi kanalını görür.`;
}

async function setupRoom(guild: Guild): Promise<string> {
  const cat = await category(guild, '🔊 ÖZEL ODALAR', []);
  const hub = await child(guild, cat, '➕ Oda Oluştur', ChannelType.GuildVoice);
  updateGuild(guild.id, { roomHub: hub.id });
  return `🔊 Özel oda sistemi kuruldu: **${hub.name}** kanalına giren kendi odasını açar.`;
}

async function setupCounter(guild: Guild): Promise<string> {
  const existing = getGuild(guild.id).counterChannel && guild.channels.cache.get(getGuild(guild.id).counterChannel!);
  const ch =
    existing ||
    (await guild.channels.create({
      name: `👥 Üye: ${guild.memberCount}`,
      type: ChannelType.GuildVoice,
      position: 0,
      permissionOverwrites: [{ id: guild.id, deny: [P.Connect] }],
    }));
  updateGuild(guild.id, { counterChannel: ch.id });
  return `👥 Üye sayacı kuruldu (10 dakikada bir güncellenir).`;
}

const steps: Record<string, (g: Guild) => Promise<string>> = { log: setupLogs, jail: setupJail, oda: setupRoom, sayac: setupCounter };

const command: Command = {
  category: 'Sistem',
  aliases: ['kur', 'install'],
  data: new SlashCommandBuilder()
    .setName('kurulum')
    .setDescription('Tek komutla otomatik kurulum: log kanalları, jail, özel oda, sayaç.')
    .addSubcommand((s) => s.setName('log').setDescription('Mod/mesaj/ses/üye/guard log kanallarını oluşturur.'))
    .addSubcommand((s) => s.setName('jail').setDescription('Cezalı rolü ve kanallarını oluşturur.'))
    .addSubcommand((s) => s.setName('oda').setDescription('Özel oda (join-to-create) sistemini kurar.'))
    .addSubcommand((s) => s.setName('sayac').setDescription('Üye sayacı kanalını kurar.'))
    .addSubcommand((s) => s.setName('hepsi').setDescription('Hepsini sırayla kurar.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(i) {
    const me = i.guild!.members.me!;
    if (!me.permissions.has([P.ManageChannels, P.ManageRoles])) return i.reply({ embeds: [err('Kurulum için **Kanalları Yönet** ve **Rolleri Yönet** yetkisi gerekli.')], ephemeral: true });

    const sub = i.options.getSubcommand();
    await i.deferReply();
    const done: string[] = [];
    for (const key of sub === 'hepsi' ? Object.keys(steps) : [sub]) {
      try {
        done.push(await steps[key](i.guild!));
      } catch (e) {
        done.push(`❌ **${key}** kurulamadı: ${e instanceof Error ? e.message : 'hata'}`);
      }
    }
    return i.editReply({ embeds: [info(`${done.join('\n')}\n\nİstersen kanalları taşıyabilir/yeniden adlandırabilirsin, ayarlar ID ile tutulur.`, '⚙️ Kurulum Tamamlandı')] });
  },
};

export default command;
