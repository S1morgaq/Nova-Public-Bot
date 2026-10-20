import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder, type Message } from 'discord.js';
import type { Command } from '../../types';
import { Colors, embed, info } from '../../utils/embed';

const CHOICES = [
  { id: 'tas', label: 'Taş', emoji: '🪨' },
  { id: 'kagit', label: 'Kağıt', emoji: '📄' },
  { id: 'makas', label: 'Makas', emoji: '✂️' },
];
const BEATS: Record<string, string> = { tas: 'makas', kagit: 'tas', makas: 'kagit' };

const command: Command = {
  category: 'Eğlence',
  aliases: ['rps', 'tas-kagit-makas'],
  data: new SlashCommandBuilder().setName('tkm').setDescription('Bota karşı taş-kağıt-makas oyna.'),
  async execute(i) {
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      CHOICES.map((c) => new ButtonBuilder().setCustomId(`tkm:${c.id}`).setLabel(c.label).setEmoji(c.emoji).setStyle(ButtonStyle.Primary)),
    );
    const msg = (await i.reply({ embeds: [info('Seçimini yap! (30 sn)', '🪨 📄 ✂️')], components: [row], fetchReply: true })) as Message;
    const click = await msg.awaitMessageComponent({ componentType: ComponentType.Button, time: 30_000, filter: (b) => b.user.id === i.user.id }).catch(() => null);
    if (!click) return msg.edit({ embeds: [info('⌛ Süre doldu.')], components: [] }).catch(() => null);

    const mine = click.customId.slice(4);
    const bot = CHOICES[Math.floor(Math.random() * 3)];
    const you = CHOICES.find((c) => c.id === mine)!;
    const result = mine === bot.id ? 'Berabere! 🤝' : BEATS[mine] === bot.id ? 'Kazandın! 🎉' : 'Kaybettin! 😈';
    const color = mine === bot.id ? Colors.warn : BEATS[mine] === bot.id ? Colors.success : Colors.error;
    return click.update({ embeds: [embed(color, `${you.emoji} **sen**  vs  **bot** ${bot.emoji}\n\n**${result}**`)], components: [] });
  },
};

export default command;
