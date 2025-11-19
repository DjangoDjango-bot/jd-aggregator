import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

export async function translateToEn(text: string): Promise<string> {
  const key = `t:en:${Buffer.from(text).toString('base64')}`;
  const cached = await redis.get(key);
  if (cached) return cached;

  const res = await fetch('https://translation.googleapis.com/language/translate/v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'zh-CN',
      target: 'en',
      format: 'text',
      key: process.env.GOOGLE_TRANSLATE_API_KEY,
    }),
  });
  const data = await res.json();
  const translated = data?.data?.translations?.[0]?.translatedText ?? '';
  if (translated) await redis.set(key, translated, { EX: 60 * 60 * 24 * 7 });
  return translated;
}
