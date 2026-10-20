import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';

const CUSTOM = /<(a?):(\w{2,32}):(\d{17,20})>/;
const IMAGE_URL = /^https?:\/\/\S+\.(png|jpe?g|gif|webp)(\?\S*)?$/i;

const cdn = (id: string, animated: boolean, size = 128) => `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=${size}`;

const command: Command = {
  category: 'Araçlar',
  aliases: ['emojiler'],
  data: new SlashCommandBuilder()
    .setName('emoji')
    .setDescription('Özel emoji araçları: başka sunucudan hareketli emoji kopyala, büyüt, listele.')
    .addSubcommand((s) =>
      s
        .setName('ekle')
        .setDescription('Emojiyi bu sunucuya ekler (hareketliyse hareketli kalır). Nitro gerekmez.')
        .addStringOption((o) => o.setName('kaynak').setDescription('Emoji (başka sunucudan) veya resim/GIF bağlantısı').setRequired(true).setMaxLength(300))
        .addStringOption((o) => o.setName('ad').setDescription('Yeni emoji adı').setRequired(true).setMinLength(2).setMaxLength(32)),
    )
    .addSubcommand((s) => s.setName('buyut').setDescription('Emojiyi büyük gösterir.').addStringOption((o) => o.setName('emoji').setDescription('Özel emoji').setRequired(true).setMaxLength(100)))
    .addSubcommand((s) => s.setName('liste').setDescription('Sunucudaki özel emojileri listeler.'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
    .setDMPermission(false),
  async execute(i) {
    const sub = i.options.getSubcommand();

    if (sub === 'liste') {
      const all = i.guild!.emojis.cache;
      const text = all.map((e) => e.toString()).join(' ').slice(0, 4000);
      return i.reply({ embeds: [new EmbedBuilder().setColor(Colors.primary).setTitle(`Emojiler (${all.size} • ${all.filter((e) => e.animated).size} hareketli)`).setDescription(text || 'Hiç özel emoji yok.')] });
    }

    if (sub === 'buyut') {
      const m = i.options.getString('emoji', true).match(CUSTOM);
      if (!m) return i.reply({ embeds: [err('Özel bir emoji gir (normal Unicode emojiler desteklenmez).')], ephemeral: true });
      return i.reply({ embeds: [new EmbedBuilder().setColor(Colors.primary).setTitle(m[2]).setImage(cdn(m[3], m[1] === 'a', 512)).setFooter({ text: `ID: ${m[3]}` })] });
    }

    const source = i.options.getString('kaynak', true).trim();
    const name = i.options.getString('ad', true).replace(/\W/g, '_');
    const m = source.match(CUSTOM);
    const url = m ? cdn(m[3], m[1] === 'a', 128) : IMAGE_URL.test(source) ? source : null;
    if (!url) return i.reply({ embeds: [err('Geçerli bir özel emoji veya resim/GIF bağlantısı gir.')], ephemeral: true });

    const created = await i.guild!.emojis.create({ attachment: url, name, reason: `${i.user.tag} /emoji ekle` }).catch((e: Error) => e);
    if (created instanceof Error) return i.reply({ embeds: [err(`Eklenemedi: ${created.message}`)], ephemeral: true });
    return i.reply({ embeds: [ok(`Emoji eklendi: ${created} \`${created.name}\``)] });
  },
};

export default command;
