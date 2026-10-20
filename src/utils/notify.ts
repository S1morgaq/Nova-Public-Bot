import { EmbedBuilder, type Client } from 'discord.js';
import { config } from '../config';
import { streamers, type Streamer } from '../db';
import { getJson, getText } from './http';

let twitchToken: { value: string; expires: number } | null = null;

async function getTwitchToken(): Promise<string | null> {
  if (twitchToken && twitchToken.expires > Date.now() + 60_000) return twitchToken.value;
  if (!config.twitchClientId || !config.twitchClientSecret) return null;
  const res = await getJson<{ access_token: string; expires_in: number }>(
    `https://id.twitch.tv/oauth2/token?client_id=${config.twitchClientId}&client_secret=${config.twitchClientSecret}&grant_type=client_credentials`,
    { method: 'POST' },
  );
  if (!res) return null;
  twitchToken = { value: res.access_token, expires: Date.now() + res.expires_in * 1000 };
  return twitchToken.value;
}

const fill = (tpl: string, vars: Record<string, string>) => Object.entries(vars).reduce((t, [k, v]) => t.replaceAll(`{${k}}`, v), tpl);

async function send(client: Client, s: Streamer, embed: EmbedBuilder, vars: Record<string, string>) {
  const channel = await client.channels.fetch(s.channelId).catch(() => null);
  if (channel?.isTextBased() && 'send' in channel) {
    await channel.send({ content: fill(s.message, vars), embeds: [embed], allowedMentions: { parse: ['everyone', 'roles'] } }).catch(() => null);
  }
}

async function checkYouTube(client: Client, s: Streamer) {
  const xml = await getText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(s.target)}`);
  const entry = xml?.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
  if (!entry) return;
  const videoId = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1];
  const title = entry.match(/<title>(.*?)<\/title>/)?.[1]?.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") ?? 'Yeni video';
  const author = xml?.match(/<author>\s*<name>(.*?)<\/name>/)?.[1] ?? 'Kanal';
  if (!videoId) return;
  if (s.last === null) {
    s.last = videoId; // ilk kontrol: eski videoyu duyurma
    return;
  }
  if (s.last === videoId) return;
  s.last = videoId;
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  await send(client, s, new EmbedBuilder().setColor(0xff0000).setTitle(title).setURL(url).setAuthor({ name: `${author} • YouTube` }).setImage(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`), { user: author, title, url });
}

async function checkTwitch(client: Client, s: Streamer) {
  const token = await getTwitchToken();
  if (!token) return;
  const data = await getJson<{ data: { id: string; user_name: string; title: string; game_name: string; viewer_count: number; thumbnail_url: string }[] }>(
    `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(s.target)}`,
    { headers: { 'Client-Id': config.twitchClientId, Authorization: `Bearer ${token}` } },
  );
  if (!data) return;
  const live = data.data[0];
  if (!live) {
    s.last = null; // yayın bitti, bir sonraki yayında tekrar bildir
    return;
  }
  if (s.last === live.id) return;
  s.last = live.id;
  const url = `https://twitch.tv/${live.user_name}`;
  await send(
    client,
    s,
    new EmbedBuilder()
      .setColor(0x9146ff)
      .setTitle(live.title || 'Canlı yayın')
      .setURL(url)
      .setAuthor({ name: `${live.user_name} • Twitch'te CANLI` })
      .addFields({ name: 'Oyun', value: live.game_name || '—', inline: true }, { name: 'İzleyici', value: String(live.viewer_count), inline: true })
      .setImage(live.thumbnail_url.replace('{width}', '640').replace('{height}', '360') + `?t=${Date.now()}`),
    { user: live.user_name, title: live.title, url },
  );
}

export function startNotifyScheduler(client: Client): void {
  const run = async () => {
    for (const s of streamers.all()) {
      if (!client.guilds.cache.has(s.guildId)) continue;
      await (s.platform === 'youtube' ? checkYouTube(client, s) : checkTwitch(client, s)).catch((e) => console.error('[notify]', e));
    }
    streamers.save();
  };
  setTimeout(run, 20_000);
  setInterval(run, 3 * 60_000);
}
