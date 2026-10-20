import { config } from '../../config';
import { topUsers, type RankBy, type UserData } from '../../db';
import { info } from '../../utils/embed';
import { makeCommand } from '../../utils/factory';

const medals = ['🥇', '🥈', '🥉'];
type Row = UserData & { userId: string };

function board(name: string, aliases: string[], title: string, by: RankBy, fmt: (u: Row) => string) {
  return makeCommand({
    name,
    aliases,
    desc: `${title} (ilk 10).`,
    category: 'Seviye',
    run: async (i) => {
      const lines = topUsers(i.guildId!, 10, by).map((u, n) => `${medals[n] ?? `**${n + 1}.**`} <@${u.userId}> — ${fmt(u)}`);
      return i.reply({ embeds: [info(lines.join('\n') || 'Henüz kimse yok.', title)], allowedMentions: { parse: [] } });
    },
  });
}

/** Tek kelimelik kısa sıralama komutları: .topmesaj .topses .topdavet .toprep .zenginler */
export default [
  board('topmesaj', ['mesajsira'], '💬 En Çok Mesaj Atanlar', 'messages', (u) => `${u.messages} mesaj`),
  board('topses', ['sessira', 'topvoice'], '🎙️ Seste En Çok Duranlar', 'voice', (u) => `${Math.floor((u.voiceSeconds ?? 0) / 3600)} sa ${Math.floor(((u.voiceSeconds ?? 0) % 3600) / 60)} dk`),
  board('topdavet', ['davetsira', 'topinvite'], '📨 En Çok Davet Edenler', 'invites', (u) => `${(u.invites ?? 0) - (u.invitesLeft ?? 0)} davet`),
  board('toprep', ['itibarsira'], '⭐ En Çok İtibar Alanlar', 'rep', (u) => `${u.rep ?? 0} ⭐`),
  board('zenginler', ['richest', 'topparalar'], `${config.currency} En Zenginler`, 'balance', (u) => `${u.balance + (u.bank ?? 0)} ${config.currency}`),
];
