import fs from 'node:fs';
import path from 'node:path';

/**
 * Hareketli (animasyonlu) emojiler Discord'da sadece özel emojidir: `<a:ad:id>`.
 * Bot, bulunduğu herhangi bir sunucudaki özel emojiyi kullanabilir. Kendi emojilerini
 * `emojis.json` dosyasına yaz (örnek: emojis.example.json), yoksa Unicode yedekleri kullanılır.
 * Emojileri sunucuna `/emoji ekle` ile başka yerden kopyalayarak da ekleyebilirsin.
 */
const FALLBACK: Record<string, string> = {
  loading: '⏳',
  success: '✅',
  error: '❌',
  coin: '🪙',
  spin: '🎰',
  dice: '🎲',
  party: '🎉',
  star: '⭐',
  heart: '❤️',
  music: '🎵',
};

let custom: Record<string, string> = {};
try {
  custom = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'emojis.json'), 'utf8'));
} catch {
  /* dosya yok: yedekler kullanılacak */
}

export const emoji = (name: string): string => custom[name] || FALLBACK[name] || '▫️';
