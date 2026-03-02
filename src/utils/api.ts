export const fetchCurrentPrice = async (policy: string): Promise<number> => {
  const apiKey = process.env.REACT_APP_CHARLI3_KEY;
  if (!apiKey) throw new Error('Charli3 key missing.');
  const res = await fetch(`https://api.charli3.io/api/v1/tokens/current?policy=${policy}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error('Fetch price failed.');
  const data = await res.json();
  return data.current_price || 0;
};

export const fetchCurrentTvl = async (policy: string): Promise<number> => {
  const apiKey = process.env.REACT_APP_CHARLI3_KEY;
  if (!apiKey) throw new Error('Charli3 key missing.');
  const res = await fetch(`https://api.charli3.io/api/v1/tokens/current?policy=${policy}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error('Fetch TVL failed.');
  const data = await res.json();
  return data.current_tvl || 0;
};

export const fetch24hAvg = async (symbol: string): Promise<number> => {
  const apiKey = process.env.REACT_APP_CHARLI3_KEY;
  if (!apiKey) throw new Error('Charli3 key missing.');
  const now = Math.floor(Date.now() / 1000);
  const dayAgo = now - 86400;
  const res = await fetch(`https://api.charli3.io/api/v1/history?symbol=${symbol}&resolution=60min&from=${dayAgo}&to=${now}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error('Fetch avg failed.');
  const data = await res.json();
  const prices = data.map((c: any) => c.close);
  return prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
};