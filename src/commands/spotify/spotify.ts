import { ActionRowBuilder, ActivityType, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import type { Command } from '../../types';
import { err } from '../../utils/embed';

const clock = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

const command: Command = {
  category: 'Spotify',
  aliases: ['sp', 'dinliyor'],
  data: new SlashCommandBuilder()
    .setName('spotify')
    .setDescription('Bir üyenin şu an Spotify\'da dinlediği şarkıyı gösterir.')
    .addUserOption((o) => o.setName('uye').setDescription('Üye (boşsa sen)'))
    .setDMPermission(false),
  async execute(i) {
    const user = i.options.getUser('uye') ?? i.user;
    const member = await i.guild!.members.fetch({ user: user.id, withPresences: true }).catch(() => null);
    const act = member?.presence?.activities.find((a) => a.type === ActivityType.Listening && a.name === 'Spotify');
    if (!act) return i.reply({ embeds: [err(`**${user.username}** şu an Spotify dinlemiyor (ya da Spotify hesabı Discord'a bağlı/görünür değil).`)], ephemeral: true });

    const cover = act.assets?.largeImage?.startsWith('spotify:') ? `https://i.scdn.co/image/${act.assets.largeImage.slice(8)}` : null;
    const url = act.syncId ? `https://open.spotify.com/track/${act.syncId}` : null;

    let progress = '';
    if (act.timestamps?.start && act.timestamps.end) {
      const total = act.timestamps.end.getTime() - act.timestamps.start.getTime();
      const now = Math.min(total, Date.now() - act.timestamps.start.getTime());
      const pos = Math.min(11, Math.floor((now / total) * 12));
      progress = `\n\n\`${clock(now)}\` ${'▬'.repeat(pos)}🔘${'▬'.repeat(11 - pos)} \`${clock(total)}\``;
    }

    const e = new EmbedBuilder()
      .setColor(0x1db954)
      .setAuthor({ name: `${user.username} dinliyor`, iconURL: user.displayAvatarURL() })
      .setTitle(act.details ?? 'Bilinmeyen şarkı')
      .setDescription(`**${(act.state ?? '').replaceAll(';', ',')}**\n💿 ${act.assets?.largeText ?? '—'}${progress}`);
    if (cover) e.setThumbnail(cover);
    if (url) e.setURL(url);

    const rows = url ? [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setLabel("Spotify'da aç").setStyle(ButtonStyle.Link).setURL(url))] : [];
    return i.reply({ embeds: [e], components: rows });
  },
};

export default command;
