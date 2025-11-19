import { jdAdapter } from '@/lib/adapters/jd';
import { taobaoAdapter } from '@/lib/adapters/taobao';
import { pddAdapter } from '@/lib/adapters/pdd';
import { a1688Adapter } from '@/lib/adapters/a1688';

const adapterMap: Record<string, any> = {
  jd: jdAdapter,
  taobao: taobaoAdapter,
  pdd: pddAdapter,
  a1688: a1688Adapter,
};

export async function POST(req: Request) {
  const { query, sources = ['jd', 'taobao', 'pdd', 'a1688'] } = await req.json();
  // JD always first
  const jobs = sources.map(async (s) => {
    const adapter = adapterMap[s];
    if (!adapter) return [];
    const res = await adapter.search(query);
    return Promise.all(res.map(async r => ({
      ...r,
      titleEn: await translateToEn(r.titleCn),
      shippingInfoEn: r.shippingInfoCn ? await translateToEn(r.shippingInfoCn) : undefined,
    })));
  });

  const merged = (await Promise.all(jobs)).flat();
  // Sort JD results first
  const sorted = merged.sort((a, b) => (a.source === 'jd' ? -1 : b.source === 'jd' ? 1 : 0));
  return NextResponse.json({ results: sorted });
}
