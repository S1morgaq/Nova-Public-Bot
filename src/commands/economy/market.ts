import { PermissionFlagsBits, type Role } from 'discord.js';
import { config } from '../../config';
import { getGuild, getUser, touch, updateGuild } from '../../db';
import { err, info, ok } from '../../utils/embed';
import { makeCommand } from '../../utils/factory';
import { roleError } from '../../utils/mod';

const cur = config.currency;

export default [
  makeCommand({
    name: 'market',
    desc: 'Sunucu marketindeki ürünleri listeler.',
    category: 'Market',
    aliases: ['shop', 'magaza'],
    run: async (i) => {
      const shop = getGuild(i.guildId!).shop;
      const lines = shop.map((s) => `**#${s.id}** ${s.name} — **${s.price}** ${cur}${s.roleId ? ` (rol: <@&${s.roleId}>)` : ''}`);
      return i.reply({ embeds: [info(`${lines.join('\n') || 'Markette ürün yok.'}\n\nSatın almak için: \`satinal <ürün adı veya #id>\``, '🛒 Market')], allowedMentions: { parse: [] } });
    },
  }),
  makeCommand({
    name: 'satinal',
    desc: 'Marketten ürün satın alır.',
    category: 'Market',
    aliases: ['buy'],
    options: (b) => b.addStringOption((o) => o.setName('urun').setDescription('Ürün adı veya ID').setRequired(true).setMaxLength(60)),
    run: async (i) => {
      const query = i.options.getString('urun', true).trim().toLocaleLowerCase('tr').replace(/^#/, '');
      const shop = getGuild(i.guildId!).shop;
      const item = shop.find((s) => String(s.id) === query || s.name.toLocaleLowerCase('tr') === query) ?? shop.find((s) => s.name.toLocaleLowerCase('tr').includes(query));
      if (!item) return i.reply({ embeds: [err('Böyle bir ürün yok. `market` ile listeye bak.')] });

      const u = getUser(i.guildId!, i.user.id);
      if (u.balance < item.price) return i.reply({ embeds: [err(`Yetersiz bakiye. Gereken: **${item.price}** ${cur}, sende: **${u.balance}** ${cur}`)] });

      if (item.roleId) {
        const member = await i.guild!.members.fetch(i.user.id);
        const role = i.guild!.roles.cache.get(item.roleId);
        if (!role) return i.reply({ embeds: [err('Bu ürünün rolü artık yok, yetkililere haber ver.')] });
        if (member.roles.cache.has(role.id)) return i.reply({ embeds: [err('Bu role zaten sahipsin.')] });
        if (role.position >= i.guild!.members.me!.roles.highest.position) return i.reply({ embeds: [err('Bu rolü veremiyorum (rolüm yeterince yüksek değil).')] });
        await member.roles.add(role, 'Market satın alma');
      } else {
        u.inventory ??= {};
        u.inventory[item.name] = (u.inventory[item.name] ?? 0) + 1;
      }
      u.balance -= item.price;
      touch();
      return i.reply({ embeds: [ok(`**${item.name}** satın alındı! (-${item.price} ${cur}) • Bakiye: ${u.balance}`)] });
    },
  }),
  makeCommand({
    name: 'envanter',
    desc: 'Satın aldığın ürünleri gösterir.',
    category: 'Market',
    aliases: ['inventory', 'inv'],
    options: (b) => b.addUserOption((o) => o.setName('uye').setDescription('Üye (boşsa sen)')),
    run: async (i) => {
      const user = i.options.getUser('uye') ?? i.user;
      const inv = Object.entries(getUser(i.guildId!, user.id).inventory ?? {});
      return i.reply({ embeds: [info(inv.map(([name, n]) => `• **${name}** × ${n}`).join('\n') || 'Envanter boş.', `🎒 ${user.username} Envanteri`)] });
    },
  }),
  makeCommand({
    name: 'marketekle',
    desc: 'Markete ürün ekler (isteğe bağlı rol verir).',
    category: 'Market',
    perms: PermissionFlagsBits.ManageGuild,
    options: (b) =>
      b
        .addIntegerOption((o) => o.setName('fiyat').setDescription('Fiyat').setMinValue(1).setMaxValue(1_000_000_000).setRequired(true))
        .addStringOption((o) => o.setName('ad').setDescription('Ürün adı').setRequired(true).setMaxLength(50))
        .addRoleOption((o) => o.setName('rol').setDescription('Satın alana verilecek rol')),
    run: async (i) => {
      const shop = getGuild(i.guildId!).shop;
      if (shop.length >= 25) return i.reply({ embeds: [err('Markette en fazla 25 ürün olabilir.')] });
      const role = i.options.getRole('rol') as Role | null;
      if (role) {
        const problem = roleError(i, i.guild!.roles.cache.get(role.id)!);
        if (problem) return i.reply({ embeds: [err(problem)] });
      }
      const id = shop.reduce((m, s) => Math.max(m, s.id), 0) + 1;
      updateGuild(i.guildId!, { shop: [...shop, { id, name: i.options.getString('ad', true), price: i.options.getInteger('fiyat', true), roleId: role?.id }] });
      return i.reply({ embeds: [ok(`Ürün eklendi: **#${id}**`)] });
    },
  }),
  makeCommand({
    name: 'marketsil',
    desc: 'Marketten ürün siler.',
    category: 'Market',
    perms: PermissionFlagsBits.ManageGuild,
    options: (b) => b.addIntegerOption((o) => o.setName('id').setDescription('Ürün ID').setRequired(true)),
    run: async (i) => {
      const shop = getGuild(i.guildId!).shop;
      const id = i.options.getInteger('id', true);
      if (!shop.some((s) => s.id === id)) return i.reply({ embeds: [err('Bu ID\'ye ait ürün yok.')] });
      updateGuild(i.guildId!, { shop: shop.filter((s) => s.id !== id) });
      return i.reply({ embeds: [ok('Ürün silindi.')] });
    },
  }),
];
