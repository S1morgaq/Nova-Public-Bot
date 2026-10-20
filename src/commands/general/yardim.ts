import { EmbedBuilder, SlashCommandBuilder, type APIApplicationCommandOption } from 'discord.js';
import { getGuild } from '../../db';
import type { Command } from '../../types';
import { Colors, err } from '../../utils/embed';
import { findCommand } from '../../utils/prefix';

const SUB = 1;
const fmt = (o: APIApplicationCommandOption) => (('required' in o && o.required) ? `<${o.name}>` : `[${o.name}]`);

const command: Command = {
  category: 'Genel',
  aliases: ['help', 'h', 'komutlar'],
  data: new SlashCommandBuilder()
    .setName('yardim')
    .setDescription('Komutları listeler; bir komutun adını yazarsan detayını gösterir.')
    .addStringOption((o) => o.setName('komut').setDescription('Detayını görmek istediğin komut').setMaxLength(32)),
  async execute(i) {
    const prefix = i.guildId ? getGuild(i.guildId).prefix : '.';
    const wanted = i.options.getString('komut')?.toLowerCase().replace(/^[/.!]/, '');

    if (wanted) {
      const cmd = findCommand(i.client.commands, wanted);
      if (!cmd) return i.reply({ embeds: [err(`\`${wanted}\` adında bir komut yok. Liste için \`${prefix}yardim\`.`)], ephemeral: true });
      const json = cmd.data.toJSON();
      const opts = json.options ?? [];
      const subs = opts.filter((o) => o.type === SUB);
      const usage = subs.length
        ? subs.map((s) => `${prefix}${json.name} ${s.name} ${(('options' in s && s.options) || []).map(fmt).join(' ')}`.trim()).join('\n')
        : `${prefix}${json.name} ${opts.map(fmt).join(' ')}`.trim();
      const e = new EmbedBuilder()
        .setColor(Colors.primary)
        .setTitle(`${cmd.prefixOnly ? '' : '/'}${json.name}`)
        .setDescription(json.description)
        .addFields({ name: 'Kullanım', value: `\`\`\`\n${usage.slice(0, 900)}\n\`\`\`` });
      if (cmd.aliases?.length) e.addFields({ name: 'Kısayollar', value: cmd.aliases.map((a) => `\`${a}\``).join(' ') });
      e.setFooter({ text: cmd.prefixOnly ? 'Sadece prefix ile çalışır' : `Hem /${json.name} hem ${prefix}${json.name}` });
      return i.reply({ embeds: [e], ephemeral: true });
    }

    const groups = new Map<string, string[]>();
    for (const c of i.client.commands.values()) groups.set(c.category, [...(groups.get(c.category) ?? []), c.data.name]);
    const fields = [...groups]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 25)
      .map(([name, list]) => ({ name: `${name} (${list.length})`, value: list.sort().map((n) => `\`${n}\``).join(' ').slice(0, 1020) }));
    const e = new EmbedBuilder()
      .setColor(Colors.primary)
      .setTitle(`📖 ${i.client.commands.size} Komut`)
      .setDescription(`Prefix: \`${prefix}\` • Detay için \`${prefix}yardim <komut>\`\nBirçok komutun alt komutları var (örn. \`${prefix}rolyonet\`). Tek tek görmek için yukarıdaki komutu kullan.`)
      .addFields(fields);
    return i.reply({ embeds: [e], ephemeral: true });
  },
};

export default command;
