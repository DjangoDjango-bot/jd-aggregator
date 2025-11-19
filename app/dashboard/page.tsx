'use client';
import { useState } from 'react';

export default function Dashboard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  async function runSearch() {
    setLoading(true);
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, sources: ['jd'] }),
    });
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">JD Aggregator</h1>
      <div className="mt-4 flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search JD.com (e.g., luxury sneakers, 电子表)…"
          className="border px-3 py-2 w-full"
        />
        <button onClick={runSearch} className="bg-black text-white px-4 py-2">Search</button>
      </div>

      {loading && <p className="mt-4">Loading…</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {results.map(r => (
          <a key={r.sourceId} href={r.url} target="_blank" className="border p-3 hover:shadow">
            <img src={r.images?.[0]} alt={r.titleEn || r.titleCn} className="w-full h-48 object-cover" />
            <div className="mt-2 text-sm text-gray-700">JD.com</div>
            <div className="font-medium">{r.titleEn || r.titleCn}</div>
            <div className="text-gray-600">{r.price} {r.currency}</div>
            <div className="text-xs text-gray-500">{r.shopName}</div>
            {r.shippingInfoEn && <div className="text-xs text-blue-600">{r.shippingInfoEn}</div>}
          </a>
        ))}
      </div>
    </div>
  );
}
