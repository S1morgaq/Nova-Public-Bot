import type { Client } from 'discord.js';
import type { BotDef } from './config';

export interface RunningBot extends BotDef {
  client: Client;
}

/** Aynı süreçte çalışan tüm bot örnekleri. */
export const bots: RunningBot[] = [];

export const inviteLink = (clientId: string, guildId?: string) =>
  `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands${guildId ? `&guild_id=${guildId}&disable_guild_select=true` : ''}`;
