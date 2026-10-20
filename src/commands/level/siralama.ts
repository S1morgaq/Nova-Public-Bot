import { SlashCommandBuilder } from 'discord.js';
import { config } from '../../config';
import { topUsers, type RankBy } from '../../db';
import type { Command } from '../../types';
import { info } from '../../utils/embed';

const medals = ['🥇', '🥈', '🥉'];

const command: Command = {
  category: 'Seviye',
  aliases: ['lb', 'top', 'leaderboard'],
  data: new SlashCommandBuilder()
    .setName('siralama')
    .setDescription('Sunucu sıralamasını gösterir.')
    .addStringOption((o) => o.setName('tur').setDescription('Sıralama türü').addChoices({ name: 'Seviye', value: 'level' }, { name: 'Para', value: 'balance' }, { name: 'Ses', value: 'voice' }, { name: 'Mesaj', value: 'messages' }, { name: 'Davet', value: 'invites' }, { name: 'İtibar', value: 'rep' }))
    .setDMPermission(false),
  async execute(i) {
    const by = (i.options.getString('tur') ?? 'level') as RankBy;
    const top = topUsers(i.guildId!, 10, by);
    const value: Record<RankBy, (u: (typeof top)[number]) => string> = {
      level: (u) => `Seviye ${u.level}`,
      balance: (u) => `${u.balance} ${config.currency}`,
      voice: (u) => `${Math.floor((u.voiceSeconds ?? 0) / 3600)} sa ${Math.floor(((u.voiceSeconds ?? 0) % 3600) / 60)} dk`,
      messages: (u) => `${u.messages} mesaj`,
      invites: (u) => `${(u.invites ?? 0) - (u.invitesLeft ?? 0)} davet`,
      rep: (u) => `${u.rep ?? 0} ⭐`,
    };
    const titles: Record<RankBy, string> = { level: '🏆 Seviye Sıralaması', balance: `${config.currency} Zenginler`, voice: '🎙️ Ses Sıralaması', messages: '💬 Mesaj Sıralaması', invites: '📨 Davet Sıralaması', rep: '⭐ İtibar Sıralaması' };
    const lines = top.map((u, n) => `${medals[n] ?? `**${n + 1}.**`} <@${u.userId}> — ${value[by](u)}`);
    return i.reply({
      embeds: [info(`${lines.join('\n') || 'Henüz kimse yok.'}\n\n[Tam listeyi gör](${config.dashboardUrl}/leaderboard/${i.guildId})`, titles[by])],
      allowedMentions: { parse: [] },
    });
  },
};

export default command;
