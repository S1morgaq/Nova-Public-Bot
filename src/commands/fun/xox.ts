import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, SlashCommandBuilder, type Message } from 'discord.js';
import type { Command } from '../../types';
import { EPH, err } from '../../utils/embed';

const WIN = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
type Cell = 'X' | 'O' | null;

function grid(board: Cell[], disabled = false) {
  return [0, 1, 2].map((r) =>
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      [0, 1, 2].map((c) => {
        const idx = r * 3 + c;
        const v = board[idx];
        return new ButtonBuilder()
          .setCustomId(`xox:${idx}`)
          .setLabel(v ?? '​')
          .setStyle(v === 'X' ? ButtonStyle.Primary : v === 'O' ? ButtonStyle.Danger : ButtonStyle.Secondary)
          .setDisabled(disabled || !!v);
      }),
    ),
  );
}

const command: Command = {
  category: 'Eğlence',
  aliases: ['tictactoe', 'ttt'],
  data: new SlashCommandBuilder()
    .setName('xox')
    .setDescription('Bir arkadaşınla XOX (tic-tac-toe) oyna.')
    .addUserOption((o) => o.setName('rakip').setDescription('Rakibin').setRequired(true))
    .setDMPermission(false),
  async execute(i) {
    const opponent = i.options.getUser('rakip', true);
    if (opponent.bot || opponent.id === i.user.id) return i.reply({ embeds: [err('Geçerli bir rakip seç (kendin veya bot olamaz).')], ephemeral: true });

    const players = [i.user, opponent];
    const marks: Cell[] = ['X', 'O'];
    const board: Cell[] = Array(9).fill(null);
    let turn = 0;

    const msg = (await i.reply({ content: `❌⭕ ${players[0]} **vs** ${players[1]}\nSıra: ${players[0]} (X)`, components: grid(board), fetchReply: true, allowedMentions: { users: [opponent.id] } })) as Message;
    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, idle: 120_000 });

    collector.on('collect', async (b) => {
      if (b.user.id !== players[turn].id) return b.reply({ content: 'Sıra sende değil!', flags: EPH });
      board[Number(b.customId.slice(4))] = marks[turn];
      const won = WIN.some((l) => board[l[0]] && l.every((k) => board[k] === board[l[0]]));
      if (won || board.every(Boolean)) {
        collector.stop('done');
        return b.update({ content: won ? `🏆 ${players[turn]} kazandı!` : '🤝 Berabere!', components: grid(board, true) });
      }
      turn = 1 - turn;
      return b.update({ content: `❌⭕ ${players[0]} **vs** ${players[1]}\nSıra: ${players[turn]} (${marks[turn]})`, components: grid(board) });
    });
    collector.on('end', (_c, reason) => {
      if (reason !== 'done') void msg.edit({ content: '⌛ Oyun zaman aşımına uğradı.', components: grid(board, true) }).catch(() => null);
    });
  },
};

export default command;
