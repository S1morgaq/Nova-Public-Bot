import type { ChatInputCommandInteraction, ClientEvents, Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';

export interface Command {
  data: {
    name: string;
    description: string;
    toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody;
  };
  category: 'Moderasyon' | 'Genel' | 'Seviye' | 'Ekonomi' | 'Eğlence' | 'Sistem' | 'Araçlar' | 'Koruma' | 'Ceza' | 'Oda' | 'Yayın' | 'Spotify' | 'Etkileşim' | 'Market' | 'Metin';
  /** true ise slash olarak kaydedilmez (Discord'un 100 komut sınırına sayılmaz); sadece prefix ile çalışır. */
  prefixOnly?: boolean;
  /** Prefix ile kullanım için ek isimler (örn. ban, kick). */
  aliases?: string[];
  execute(interaction: ChatInputCommandInteraction): Promise<unknown>;
}

export interface BotEvent {
  name: keyof ClientEvents;
  once?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute(...args: any[]): Promise<unknown> | unknown;
}

declare module 'discord.js' {
  interface Client {
    commands: Collection<string, Command>;
    /** Bu bot örneğinde aktif olan modüller. Olay işleyicileri buna bakarak çalışır. */
    modules: Set<string>;
    botName: string;
  }
}
