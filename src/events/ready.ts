import { ActivityType, type Client } from 'discord.js';
import { config } from '../config';
import type { BotEvent } from '../types';
import { startAutoBackup } from '../utils/autobackup';
import { startGiveawayScheduler } from '../utils/giveaway';
import { startJailScheduler } from '../utils/jail';
import { startCounterScheduler } from '../utils/counter';
import { refreshInvites } from '../utils/invites';
import { startNotifyScheduler } from '../utils/notify';
import { startReminderScheduler } from '../utils/reminders';

const event: BotEvent = {
  name: 'ready',
  once: true,
  async execute(client: Client<true>) {
    // Sadece prefix komutları slash olarak kaydedilmez
    let body = client.commands.filter((c) => !c.prefixOnly).map((c) => c.data.toJSON());
    if (body.length > 100) {
      console.warn(`[${client.botName}] ${body.length} komut var ama Discord uygulama başına en fazla 100 slash komuta izin verir. Fazlası yüklenmeyecek (prefix ile çalışır). Modülleri birden çok bota dağıt.`);
      body = body.slice(0, 100);
    }
    if (config.guildId) {
      await client.guilds.cache.get(config.guildId)?.commands.set(body);
      await client.application.commands.set([]);
    } else {
      await client.application.commands.set(body);
    }
    console.log(`[${client.botName}] ${client.user.tag} hazır • ${client.guilds.cache.size} sunucu • ${body.length} komut • modüller: ${[...client.modules].join(', ')}`);

    const status = [
      () => (client.commands.size ? `/yardim • .yardim • ${client.guilds.cache.size} sunucu` : `${client.botName} • ${client.guilds.cache.size} sunucu`),
      () => `${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} kullanıcı`,
    ];
    let n = 0;
    const tick = () => client.user.setActivity(status[n++ % status.length](), { type: ActivityType.Watching });
    tick();
    setInterval(tick, 30_000);

    if (client.modules.has('tools')) {
      startGiveawayScheduler(client);
      startReminderScheduler(client);
    }
    if (client.modules.has('welcome')) for (const guild of client.guilds.cache.values()) await refreshInvites(guild);
    if (client.modules.has('guard')) startAutoBackup(client);
    if (client.modules.has('jail')) startJailScheduler(client);
    if (client.modules.has('notify')) startNotifyScheduler(client);
    if (client.modules.has('stats')) startCounterScheduler(client);
  },
};

export default event;
