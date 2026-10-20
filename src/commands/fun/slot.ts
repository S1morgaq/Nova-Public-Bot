import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { getUser, touch } from '../../db';
import type { Command } from '../../types';
import { Colors, embed, err } from '../../utils/embed';
import { emoji } from '../../utils/emojis';
import { sleep } from '../../utils/http';

const SYMBOLS = ['🍒', '🍋', '🍇', '🔔', '💎', '7️⃣'];
const pick = () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];

const command: Command = {
  category: 'Eğlence',
  aliases: ['slots'],
  data: new SlashCommandBuilder()
    .setName('slot')
    .setDescription('Animasyonlu slot makinesi! Bahis koyabilirsin.')
    .addIntegerOption((o) => o.setName('bahis').setDescription('Bahis miktarı').setMinValue(1))
    .setDMPermission(false),
  async execute(i) {
    const bet = i.options.getInteger('bahis');
    const user = getUser(i.guildId!, i.user.id);
    if (bet && user.balance < bet) return i.reply({ embeds: [err('Yeterli bakiyen yok.')], ephemeral: true });

    const final = [pick(), pick(), pick()];
    const view = (r: string[], note: string, color: number = Colors.primary) => embed(color, `${emoji('spin')} **SLOT** ${emoji('spin')}\n\n┃ ${r.join(' ┃ ')} ┃\n\n${note}`);

    await i.reply({ embeds: [view([pick(), pick(), pick()], 'Çevriliyor...')] });
    // Makaralar sırayla durur
    await sleep(900);
    await i.editReply({ embeds: [view([final[0], pick(), pick()], 'Çevriliyor...')] });
    await sleep(900);
    await i.editReply({ embeds: [view([final[0], final[1], pick()], 'Çevriliyor...')] });
    await sleep(900);

    const [a, b, c] = final;
    const triple = a === b && b === c;
    const pair = !triple && (a === b || b === c || a === c);
    const mult = triple ? (a === '7️⃣' ? 20 : a === '💎' ? 10 : 5) : pair ? 1 : 0;

    let note: string;
    if (bet) {
      const delta = mult ? bet * mult : -bet;
      user.balance += delta;
      touch();
      note = mult ? `${emoji('party')} **+${delta}** ${config.currency} kazandın! (x${mult})` : `💸 **-${bet}** ${config.currency} kaybettin.`;
      note += `\nBakiye: ${user.balance} ${config.currency}`;
    } else {
      note = mult ? `${emoji('party')} ${triple ? 'JACKPOT!' : 'İkili tutturdun!'}` : 'Olmadı, bir daha dene!';
    }
    return i.editReply({ embeds: [view(final, note, mult ? Colors.success : Colors.error)] });
  },
};

export default command;
