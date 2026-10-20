import crypto from 'node:crypto';
import path from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import session from 'express-session';
import { ChannelType, PermissionFlagsBits, type Client, type Guild } from 'discord.js';
import { config } from '../config';
import { getGuild, stats, topUsers, updateGuild } from '../db';
import { bots } from '../registry';

interface SessionGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

declare module 'express-session' {
  interface SessionData {
    user?: { id: string; username: string; avatar: string | null };
    guilds?: SessionGuild[];
    state?: string;
    csrf?: string;
    flash?: { type: 'ok' | 'err'; text: string };
  }
}

const API = 'https://discord.com/api/v10';
const ROOT = path.join(process.cwd(), 'src', 'dashboard');
const redirectUri = `${config.dashboardUrl}/callback`;

const canManage = (g: SessionGuild) =>
  g.owner || (BigInt(g.permissions) & (PermissionFlagsBits.ManageGuild | PermissionFlagsBits.Administrator)) !== 0n;

const inviteUrl = (guildId?: string) =>
  `https://discord.com/oauth2/authorize?client_id=${config.clientId}&permissions=8&scope=bot%20applications.commands${guildId ? `&guild_id=${guildId}&disable_guild_select=true` : ''}`;

export function startDashboard(client: Client): void {
  const app = express();
  app.set('view engine', 'ejs');
  app.set('views', path.join(ROOT, 'views'));
  app.disable('x-powered-by');
  app.use('/static', express.static(path.join(ROOT, 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, sameSite: 'lax', maxAge: 7 * 86400_000, secure: config.dashboardUrl.startsWith('https') },
    }),
  );
  if (config.dashboardUrl.startsWith('https')) app.set('trust proxy', 1);

  app.use((req, res, next) => {
    req.session.csrf ??= crypto.randomBytes(16).toString('hex');
    res.locals.user = req.session.user ?? null;
    res.locals.csrf = req.session.csrf;
    res.locals.botName = client.user?.username ?? 'Bot';
    res.locals.botAvatar = client.user?.displayAvatarURL({ size: 128 }) ?? '';
    res.locals.inviteUrl = inviteUrl();
    res.locals.flash = req.session.flash ?? null;
    res.locals.path = req.path;
    delete req.session.flash;
    next();
  });

  const requireAuth = (req: Request, res: Response, next: NextFunction) => (req.session.user ? next() : res.redirect('/login'));

  const loadGuild = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const sg = req.session.guilds?.find((g) => g.id === id);
    const guild = client.guilds.cache.get(id);
    if (!sg || !canManage(sg)) return res.status(403).render('error', { code: 403, message: 'Bu sunucuyu yönetme yetkin yok.' });
    if (!guild) return res.redirect(inviteUrl(id));
    res.locals.guild = guild;
    next();
  };

  const stat = () => ({
    guilds: client.guilds.cache.size,
    users: client.guilds.cache.reduce((a, g) => a + g.memberCount, 0),
    commands: bots.reduce((a, b) => a + b.client.commands.size, 0),
    bots: bots.length,
    ping: Math.round(client.ws.ping),
  });

  app.get('/', (_req, res) => res.render('index', { stats: stat(), features: FEATURES }));
  app.get('/api/stats', (_req, res) => res.json({ ...stat(), ...stats() }));

  // ---- OAuth2 ----
  app.get('/login', (req, res) => {
    if (!config.clientSecret) return res.status(500).render('error', { code: 500, message: 'CLIENT_SECRET .env dosyasında tanımlı değil.' });
    req.session.state = crypto.randomBytes(16).toString('hex');
    const q = new URLSearchParams({ client_id: config.clientId, redirect_uri: redirectUri, response_type: 'code', scope: 'identify guilds', state: req.session.state });
    res.redirect(`https://discord.com/oauth2/authorize?${q}`);
  });

  app.get('/callback', async (req, res) => {
    const { code, state } = req.query as Record<string, string | undefined>;
    if (!code || !state || state !== req.session.state) return res.status(400).render('error', { code: 400, message: 'Geçersiz giriş isteği.' });
    try {
      const tokenRes = await fetch(`${API}/oauth2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
      });
      if (!tokenRes.ok) throw new Error(`token ${tokenRes.status}`);
      const { access_token } = (await tokenRes.json()) as { access_token: string };
      const headers = { Authorization: `Bearer ${access_token}` };
      const [user, guilds] = await Promise.all([
        fetch(`${API}/users/@me`, { headers }).then((r) => r.json()) as Promise<{ id: string; username: string; avatar: string | null }>,
        fetch(`${API}/users/@me/guilds`, { headers }).then((r) => r.json()) as Promise<SessionGuild[]>,
      ]);
      req.session.regenerate((e) => {
        if (e) throw e;
        req.session.user = { id: user.id, username: user.username, avatar: user.avatar };
        req.session.guilds = guilds.map(({ id, name, icon, owner, permissions }) => ({ id, name, icon, owner, permissions }));
        res.redirect('/dashboard');
      });
    } catch (e) {
      console.error('[dashboard] oauth', e);
      res.status(500).render('error', { code: 500, message: 'Discord ile giriş başarısız oldu.' });
    }
  });

  app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

  // ---- Panel ----
  app.get('/dashboard', requireAuth, (req, res) => {
    const guilds = (req.session.guilds ?? []).filter(canManage).map((g) => ({
      ...g,
      botIn: client.guilds.cache.has(g.id),
      iconUrl: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
      invite: inviteUrl(g.id),
    }));
    res.render('dashboard', { guilds: guilds.sort((a, b) => Number(b.botIn) - Number(a.botIn)) });
  });

  app.get('/dashboard/:id', requireAuth, loadGuild, (req, res) => {
    const guild = res.locals.guild as Guild;
    res.render('guild', {
      settings: getGuild(guild.id),
      channels: guild.channels.cache.filter((c) => c.type === ChannelType.GuildText).sort((a, b) => a.rawPosition - b.rawPosition).map((c) => ({ id: c.id, name: c.name })),
      vchannels: guild.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).sort((a, b) => a.rawPosition - b.rawPosition).map((c) => ({ id: c.id, name: c.name })),
      roles: guild.roles.cache.filter((r) => r.id !== guild.id && !r.managed).sort((a, b) => b.position - a.position).map((r) => ({ id: r.id, name: r.name })),
      memberCount: guild.memberCount,
      isOwner: req.session.user?.id === guild.ownerId,
    });
  });

  app.post('/dashboard/:id', requireAuth, loadGuild, (req, res) => {
    if (req.body._csrf !== req.session.csrf) return res.status(403).render('error', { code: 403, message: 'Geçersiz form anahtarı (CSRF).' });
    const guild = res.locals.guild as Guild;
    const b = req.body as Record<string, string | undefined>;
    const chan = (v?: string) => (v && guild.channels.cache.get(v)?.type === ChannelType.GuildText ? v : null);
    const role = (v?: string) => (v && guild.roles.cache.has(v) && v !== guild.id ? v : null);
    const vchan = (v?: string) => (v && guild.channels.cache.get(v)?.type === ChannelType.GuildVoice ? v : null);
    const isOwner = req.session.user?.id === guild.ownerId;
    const on = (k: string) => b[k] === 'on';
    const num = (v: string | undefined, min: number, max: number, fallback: number) => {
      const n = Math.floor(Number(v));
      return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
    };

    updateGuild(guild.id, {
      logChannel: chan(b.logChannel),
      welcomeChannel: chan(b.welcomeChannel),
      goodbyeChannel: chan(b.goodbyeChannel),
      welcomeMessage: (b.welcomeMessage ?? '').trim().slice(0, 500) || getGuild(guild.id).welcomeMessage,
      autoRole: role(b.autoRole),
      levelEnabled: on('levelEnabled'),
      prefix: (b.prefix ?? '').trim().slice(0, 3) || getGuild(guild.id).prefix,
      jailRole: role(b.jailRole),
      roomHub: vchan(b.roomHub),
      counterChannel: vchan(b.counterChannel),
      // Guard ayarlarını sadece sunucu sahibi panelden değiştirebilir
      ...(isOwner
        ? {
            guard: {
              ...getGuild(guild.id).guard,
              enabled: on('g_enabled'),
              punishment: (['ban', 'kick', 'strip'] as const).find((p) => p === b.g_punishment) ?? 'ban',
              limit: num(b.g_limit, 1, 20, 3),
            },
          }
        : {}),
      starChannel: chan(b.starChannel),
      starThreshold: num(b.starThreshold, 1, 25, 3),
      antiRaid: {
        enabled: on('ar_enabled'),
        joins: num(b.ar_joins, 2, 50, 5),
        seconds: num(b.ar_seconds, 3, 120, 10),
        minAccountDays: num(b.ar_age, 0, 365, 0),
      },
      automod: {
        invites: on('am_invites'),
        links: on('am_links'),
        caps: on('am_caps'),
        spam: on('am_spam'),
        badWords: (b.badWords ?? '')
          .split(/[,\n]/)
          .map((w) => w.trim().toLocaleLowerCase('tr'))
          .filter(Boolean)
          .slice(0, 200),
      },
    });
    req.session.flash = { type: 'ok', text: 'Ayarlar kaydedildi.' };
    res.redirect(`/dashboard/${guild.id}`);
  });

  // Herkese açık sıralama
  app.get('/leaderboard/:id', async (req, res) => {
    const guild = client.guilds.cache.get(req.params.id);
    if (!guild) return res.status(404).render('error', { code: 404, message: 'Sunucu bulunamadı.' });
    const rows = await Promise.all(
      topUsers(guild.id, 50).map(async (u, n) => {
        const user = await client.users.fetch(u.userId).catch(() => null);
        return { rank: n + 1, name: user?.username ?? u.userId, avatar: user?.displayAvatarURL({ size: 64 }) ?? '', level: u.level, xp: u.xp, messages: u.messages };
      }),
    );
    res.render('leaderboard', { guild: { name: guild.name, icon: guild.iconURL({ size: 128 }) }, rows });
  });

  app.use((_req, res) => res.status(404).render('error', { code: 404, message: 'Sayfa bulunamadı.' }));

  app.listen(config.port, () => console.log(`[PANEL] ${config.dashboardUrl} (port ${config.port})`));
}

const FEATURES = [
  { icon: '🧩', title: 'Çoklu Bot Mimarisi', text: 'Guard, karşılama, istatistik... Her modülü ayrı bir bota ver, tek projeden yönet.' },
  { icon: '🔒', title: 'Guard & Yedek', text: 'Kanal/rol silme, izinsiz bot, ban limiti koruması. Silineni geri açar, günlük otomatik yedek.' },
  { icon: '⚙️', title: 'Tek Komut Kurulum', text: '/kurulum hepsi: log kanalları, jail, özel oda ve sayaç otomatik kurulur.' },
  { icon: '🎬', title: 'GIF & Animasyon', text: 'Hareketli GIF etkileşimleri, animasyonlu slot/zar/yazı-tura, özel hareketli emoji desteği.' },
  { icon: '🎧', title: 'Spotify & Yayın', text: 'Dinlenen şarkıyı göster, YouTube video ve Twitch yayın bildirimleri.' },
  { icon: '🎮', title: 'Oyunlar', text: 'XOX, taş-kağıt-makas, slot, ship ve daha fazlası.' },
  { icon: '🛡️', title: 'Moderasyon', text: 'Yasakla, at, sustur, uyar, temizle. Rol hiyerarşisi kontrolü ve otomatik 3 uyarı cezası.' },
  { icon: '🤖', title: 'AutoMod', text: 'Davet/link engeli, spam, büyük harf ve yasaklı kelime filtresi. Panelden aç/kapat.' },
  { icon: '📈', title: 'Seviye Sistemi', text: 'Mesaj başına XP, seviye atlama ve herkese açık web sıralaması.' },
  { icon: '🪙', title: 'Ekonomi', text: 'Günlük ödül, çalışma, para gönderme ve yazı-tura bahisleri.' },
  { icon: '🎫', title: 'Ticket', text: 'Tek tıkla özel destek kanalı, yetkili rolü ve kategori desteği.' },
  { icon: '🎉', title: 'Çekiliş', text: 'Butonlu çekilişler, çoklu kazanan, otomatik bitirme.' },
  { icon: '👋', title: 'Karşılama & Log', text: 'Özelleştirilebilir hoş geldin mesajı, otorol ve detaylı log kanalı.' },
  { icon: '🖥️', title: 'Web Panel', text: 'Discord ile giriş yap, tüm ayarları tarayıcıdan yönet.' },
];
