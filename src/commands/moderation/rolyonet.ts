import { PermissionFlagsBits, SlashCommandBuilder, type GuildMember } from 'discord.js';
import type { Command } from '../../types';
import { Colors, embed, err, info, ok } from '../../utils/embed';
import { hierarchyError, roleError } from '../../utils/mod';

const roleOpt = (o: import('discord.js').SlashCommandRoleOption) => o.setName('rol').setDescription('Rol').setRequired(true);

const command: Command = {
  category: 'Moderasyon',
  aliases: ['roleman', 'rolyonetim'],
  data: new SlashCommandBuilder()
    .setName('rolyonet')
    .setDescription('Gelişmiş rol yönetimi: toplu ver/al, renk, isim, kopyala, listele...')
    .addSubcommand((s) =>
      s
        .setName('topluver')
        .setDescription('Rolü bir gruba toplu verir.')
        .addRoleOption(roleOpt)
        .addStringOption((o) => o.setName('hedef').setDescription('Kime?').setRequired(true).addChoices({ name: 'Herkes', value: 'herkes' }, { name: 'Sadece insanlar', value: 'insan' }, { name: 'Sadece botlar', value: 'bot' })),
    )
    .addSubcommand((s) => s.setName('toplual').setDescription('Rolü sahip olan herkesten alır.').addRoleOption(roleOpt))
    .addSubcommand((s) => s.setName('renk').setDescription('Rol rengini değiştirir.').addRoleOption(roleOpt).addStringOption((o) => o.setName('hex').setDescription('Örn. #ff0000').setRequired(true).setMaxLength(7)))
    .addSubcommand((s) => s.setName('isim').setDescription('Rol adını değiştirir.').addRoleOption(roleOpt).addStringOption((o) => o.setName('ad').setDescription('Yeni ad').setRequired(true).setMaxLength(100)))
    .addSubcommand((s) => s.setName('sil').setDescription('Rolü siler.').addRoleOption(roleOpt).addBooleanOption((o) => o.setName('onay').setDescription('Evet = onaylıyorum').setRequired(true)))
    .addSubcommand((s) => s.setName('ayir').setDescription('Üye listesinde ayrı göster aç/kapat.').addRoleOption(roleOpt).addBooleanOption((o) => o.setName('durum').setDescription('Açık mı?').setRequired(true)))
    .addSubcommand((s) => s.setName('etiket').setDescription('Herkes tarafından etiketlenebilir aç/kapat.').addRoleOption(roleOpt).addBooleanOption((o) => o.setName('durum').setDescription('Açık mı?').setRequired(true)))
    .addSubcommand((s) => s.setName('kopyala').setDescription('Rolü izinleriyle birlikte kopyalar.').addRoleOption(roleOpt))
    .addSubcommand((s) => s.setName('uyeler').setDescription('Role sahip üyeleri listeler.').addRoleOption(roleOpt))
    .addSubcommand((s) => s.setName('liste').setDescription('Tüm rolleri üye sayılarıyla listeler.'))
    .addSubcommand((s) => s.setName('temizle').setDescription('Üyenin tüm rollerini alır.').addUserOption((o) => o.setName('uye').setDescription('Üye').setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false),
  async execute(i) {
    const guild = i.guild!;
    const sub = i.options.getSubcommand();

    if (sub === 'liste') {
      const lines = guild.roles.cache
        .filter((r) => r.id !== guild.id)
        .sort((a, b) => b.position - a.position)
        .first(30)
        .map((r) => `${r} • ${r.members.size} üye`);
      return i.reply({ embeds: [info(lines.join('\n') || 'Rol yok.', `Roller (${guild.roles.cache.size - 1})`)], allowedMentions: { parse: [] } });
    }

    if (sub === 'temizle') {
      const member = await guild.members.fetch(i.options.getUser('uye', true).id).catch(() => null);
      if (!member) return i.reply({ embeds: [err('Üye sunucuda değil.')], ephemeral: true });
      const problem = hierarchyError(i, member);
      if (problem) return i.reply({ embeds: [err(problem)], ephemeral: true });
      const removable = member.roles.cache.filter((r) => r.id !== guild.id && !r.managed && r.editable);
      await member.roles.remove(removable, `${i.user.tag}: rolyonet temizle`);
      return i.reply({ embeds: [ok(`${member} üyesinden ${removable.size} rol alındı.`)], allowedMentions: { parse: [] } });
    }

    const role = guild.roles.cache.get(i.options.getRole('rol', true).id)!;
    const problem = roleError(i, role);
    if (problem && sub !== 'uyeler') return i.reply({ embeds: [err(problem)], ephemeral: true });
    const reason = `${i.user.tag}: rolyonet ${sub}`;

    switch (sub) {
      case 'topluver':
      case 'toplual': {
        await i.deferReply();
        await guild.members.fetch();
        const give = sub === 'topluver';
        const filter = i.options.getString('hedef') ?? 'herkes';
        const targets = guild.members.cache.filter((m: GuildMember) => (give ? !m.roles.cache.has(role.id) : m.roles.cache.has(role.id)) && (filter === 'insan' ? !m.user.bot : filter === 'bot' ? m.user.bot : true));
        let done = 0;
        for (const m of targets.values()) {
          if (await (give ? m.roles.add(role, reason) : m.roles.remove(role, reason)).then(() => true).catch(() => false)) done++;
        }
        return i.editReply({ embeds: [ok(`${role} ${give ? 'verildi' : 'alındı'}: **${done}/${targets.size}** üye.`)], allowedMentions: { parse: [] } });
      }
      case 'renk': {
        const hex = i.options.getString('hex', true).replace('#', '');
        if (!/^[0-9a-f]{6}$/i.test(hex)) return i.reply({ embeds: [err('Geçerli bir hex renk gir.')], ephemeral: true });
        await role.setColor(parseInt(hex, 16), reason);
        return i.reply({ embeds: [embed(parseInt(hex, 16), `✅ ${role} rengi **#${hex.toUpperCase()}** yapıldı.`)], allowedMentions: { parse: [] } });
      }
      case 'isim': {
        const name = i.options.getString('ad', true);
        await role.setName(name, reason);
        return i.reply({ embeds: [ok(`Rol adı **${name}** oldu.`)] });
      }
      case 'sil': {
        if (!i.options.getBoolean('onay', true)) return i.reply({ embeds: [err('İşlem iptal edildi.')], ephemeral: true });
        const name = role.name;
        await role.delete(reason);
        return i.reply({ embeds: [ok(`**${name}** rolü silindi.`)] });
      }
      case 'ayir':
        await role.setHoist(i.options.getBoolean('durum', true), reason);
        return i.reply({ embeds: [ok(`${role} ayrı gösterim güncellendi.`)], allowedMentions: { parse: [] } });
      case 'etiket':
        await role.setMentionable(i.options.getBoolean('durum', true), reason);
        return i.reply({ embeds: [ok(`${role} etiketlenebilirlik güncellendi.`)], allowedMentions: { parse: [] } });
      case 'kopyala': {
        const copy = await guild.roles.create({ name: `${role.name} (kopya)`, color: role.color, hoist: role.hoist, mentionable: role.mentionable, permissions: role.permissions, reason });
        return i.reply({ embeds: [ok(`Kopyalandı: ${copy}`)], allowedMentions: { parse: [] } });
      }
      default: {
        await guild.members.fetch();
        const members = role.members.map((m) => m.toString());
        return i.reply({ embeds: [embed(Colors.primary, `${members.slice(0, 40).join(' ') || 'Kimse yok.'}${members.length > 40 ? `\n… ve ${members.length - 40} üye daha` : ''}`, `${role.name} • ${members.length} üye`)], allowedMentions: { parse: [] } });
      }
    }
  },
};

export default command;
