// lib/adapters/jd.ts
import { chromium } from 'playwright';
import type { SourceAdapter, ScrapeResult } from './types';

export const jdAdapter: SourceAdapter = {
  name: 'jd',
  async search(query: string): Promise<ScrapeResult[]> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      storageState: 'storage/jd.json', // export after manual login once
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
    });
    const page = await context.newPage();

    await page.goto(`https://search.jd.com/Search?keyword=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('.gl-item');

    const items = await page.$$eval('.gl-item', cards =>
      cards.slice(0, 20).map(card => {
        const title = card.querySelector('.p-name em')?.textContent?.trim() || '';
        const price = parseFloat((card.querySelector('.p-price i')?.textContent || '0').replace(/[^\d.]/g, ''));
        const img = (card.querySelector('.p-img img') as HTMLImageElement)?.src || '';
        const url = (card.querySelector('.p-name a') as HTMLAnchorElement)?.href || '';
        const shop = card.querySelector('.p-shop a')?.textContent?.trim() || '';
        const flags = Array.from(card.querySelectorAll('.p-icons i')).map(i => i.textContent?.trim());
        return { title, price, img, url, shop, flags };
      })
    );

    const results: ScrapeResult[] = items.map((it, idx) => ({
      source: 'jd',
      sourceId: `${Date.now()}-${idx}`,
      titleCn: it.title,
      price: it.price,
      currency: 'CNY',
      images: [it.img],
      shopName: it.shop,
      url: it.url,
      shopRating: it.flags?.includes('京东自营') ? 5 : 3, // bias self-operated
      shippingInfoCn: it.flags?.join(', '),
    }));

    await browser.close();
    return results;
  },

  async getById(id: string): Promise<ScrapeResult | null> {
    return null; // implement deep scrape if needed
  },
};
