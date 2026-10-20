import { EmbedBuilder, SlashCommandBuilder, type Message, type TextChannel } from 'discord.js';
import type { Command } from '../../types';
import { Colors, err, ok } from '../../utils/embed';

const NUMS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

const command: Command = {
  category: 'Araçlar',
  aliases: ['poll'],
  data: new SlashCommandBuilder()
    .setName('anket')
    .setDescription('Anket başlatır. Biçim: Soru | Seçenek 1 | Seçenek 2 ... (seçenek yoksa Evet/Hayır)')
    .addStringOption((o) => o.setName('icerik').setDescription('Soru | Seçenek 1 | Seçenek 2').setRequired(true).setMaxLength(800))
    .setDMPermission(false),
  async execute(i) {
    const [question, ...options] = i.options.getString('icerik', true).split('|').map((s) => s.trim()).filter(Boolean);
    if (options.length === 1 || options.length > 10) return i.reply({ embeds: [err('2 ile 10 arası seçenek gir ya da hiç girme (Evet/Hayır).')], ephemeral: true });

    const yesNo = options.length === 0;
    const emojis = yesNo ? ['✅', '❌'] : NUMS.slice(0, options.length);
    const body = yesNo ? '' : options.map((o, n) => `${NUMS[n]} ${o}`).join('\n');
    const e = new EmbedBuilder().setColor(Colors.primary).setTitle(`📊 ${question}`).setDescription(body || null).setFooter({ text: `${i.user.username} tarafından` });

    const sent: Message = await (i.channel as TextChannel).send({ embeds: [e] });
    for (const em of emojis) await sent.react(em).catch(() => null);
    return i.reply({ embeds: [ok('Anket oluşturuldu.')], ephemeral: true });
  },
};

export default command;
