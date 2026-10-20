/** Zaman aşımlı JSON isteği. Hata olursa null döner. */
export async function getJson<T = unknown>(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<T | null> {
  try {
    const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs), headers: { 'User-Agent': 'NovaBot/1.0', ...init.headers } });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

export async function getText(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { 'User-Agent': 'NovaBot/1.0' } });
    return res.ok ? await res.text() : null;
  } catch {
    return null;
  }
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
