"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Helper: format large numbers (e.g. 3420000000000 -> "3.42T")
 */
function formatLargeNumber(num: number) {
  if (num >= 1_000_000_000_000) return `${(num / 1_000_000_000_000).toFixed(2)}T`;
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toString();
}

/**
 * Hook: animate number from `from` to `to` over `duration` ms.
 * Returns current animated value (number).
 */
function useAnimatedNumber(to: number, duration = 700) {
  const [value, setValue] = useState<number>(to);
  const fromRef = useRef<number>(to);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const start = performance.now();
    const from = fromRef.current ?? 0;
    const delta = to - from;
    if (Math.abs(delta) < 0.0001) {
      setValue(to);
      fromRef.current = to;
      return;
    }

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeOutCubic(t);
      setValue(from + delta * eased);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [to, duration]);

  return value;
}

interface Coin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export default function StatCards() {
  const [loading, setLoading] = useState(true);
  const [rawTotalMarketCap, setRawTotalMarketCap] = useState<number>(0);
  const [gainer, setGainer] = useState<Coin | null>(null);
  const [loser, setLoser] = useState<Coin | null>(null);

  const animatedTotal = useAnimatedNumber(rawTotalMarketCap, 900);
  const animatedGainerPercent = useAnimatedNumber(
    gainer ? Math.abs(gainer.price_change_percentage_24h) : 0,
    700
  );
  const animatedLoserPercent = useAnimatedNumber(
    loser ? Math.abs(loser.price_change_percentage_24h) : 0,
    700
  );

  // const fetchCoins = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetch("/api/markets");
  //     if (!res.ok) throw new Error("API request failed");
  //     const data: Coin[] = await res.json();

  //     const normalized = data.map((c) => ({
  //       ...c,
  //       current_price: Number(c.current_price ?? 0),
  //       price_change_percentage_24h: Number(c.price_change_percentage_24h ?? 0),
  //       market_cap: Number(c.market_cap ?? 0),
  //     }));

  //     // compute total market cap of top 10
  //     const top10 = normalized.slice(0, 10);
  //     const total = top10.reduce((s, c) => s + (c.market_cap || 0), 0);
  //     setRawTotalMarketCap(total);

  //     // find top gainer & loser
  //     const sortedByChange = [...normalized].sort(
  //       (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
  //     );
  //     setGainer(sortedByChange[0] ?? null);
  //     setLoser(sortedByChange[sortedByChange.length - 1] ?? null);
  //   } catch (err) {
  //     console.error("Error fetching market data:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const fetchCoins = async () => {
  try {
    setLoading(true);
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        : "";
    const res = await fetch(`${baseUrl}/api/markets`);
    if (!res.ok) throw new Error(`API request failed: ${res.statusText}`);
    const data: Coin[] = await res.json();

    const normalized = data.map((c) => ({
      ...c,
      current_price: Number(c.current_price ?? 0),
      price_change_percentage_24h: Number(c.price_change_percentage_24h ?? 0),
      market_cap: Number(c.market_cap ?? 0),
    }));

    const top10 = normalized.slice(0, 10);
    const total = top10.reduce((s, c) => s + (c.market_cap || 0), 0);
    setRawTotalMarketCap(total);

    const sortedByChange = [...normalized].sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    );
    setGainer(sortedByChange[0] ?? null);
    setLoser(sortedByChange[sortedByChange.length - 1] ?? null);
  } catch (err) {
    console.error("Error fetching market data:", err);
  } finally {
    setLoading(false);
  }
};


  // initial + refresh every 60s
  useEffect(() => {
    fetchCoins();
    const id = setInterval(fetchCoins, 60_000);
    return () => clearInterval(id);
  }, []);

  const displayTotal = formatLargeNumber(Math.round(animatedTotal));
  const displayGainerValue = gainer ? `${gainer.name} (${gainer.symbol.toUpperCase()})` : "-";
  const displayLoserValue = loser ? `${loser.name} (${loser.symbol.toUpperCase()})` : "-";
  const displayGainerPercent = `${animatedGainerPercent.toFixed(2)}%`;
  const displayLoserPercent = `${animatedLoserPercent.toFixed(2)}%`;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 pt-32">
      {loading ? (
        <>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-white/5 to-white/2 p-[1px] rounded-2xl"
            >
              <div className="bg-[#0f1115]/90 backdrop-blur-xl rounded-2xl p-6 h-28 animate-pulse" />
            </div>
          ))}
        </>
      ) : (
        <>
          {/* Total Market Cap */}
          <div className="relative bg-gradient-to-br from-blue-500/20 to-cyan-400/10 p-[1px] rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <div className="bg-[#0f1115]/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
              <h2 className="text-gray-400 text-sm mb-2 tracking-wide">Total Market Cap (Top 10)</h2>
              <p className="text-3xl font-bold text-blue-400">{displayTotal}</p>
              <p className="text-gray-500 text-sm mt-1">Live market data · updated every 60s</p>
            </div>
          </div>

          {/* Top Gainer */}
          <div className="relative bg-gradient-to-br from-green-500/20 to-emerald-400/10 p-[1px] rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <div className="bg-[#0f1115]/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
              <h2 className="text-gray-400 text-sm mb-2 tracking-wide">Top Gainer (24h)</h2>
              <p className="text-2xl font-bold text-green-400">{displayGainerValue}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-green-400 text-lg font-semibold">{displayGainerPercent}</span>
                <p className="text-gray-500 text-sm">since last 24 hours</p>
              </div>
            </div>
          </div>

          {/* Top Loser */}
          <div className="relative bg-gradient-to-br from-red-500/20 to-pink-400/10 p-[1px] rounded-2xl hover:scale-[1.02] transition-transform duration-300">
            <div className="bg-[#0f1115]/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg">
              <h2 className="text-gray-400 text-sm mb-2 tracking-wide">Top Loser (24h)</h2>
              <p className="text-2xl font-bold text-red-400">{displayLoserValue}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-red-400 text-lg font-semibold">{displayLoserPercent}</span>
                <p className="text-gray-500 text-sm">since last 24 hours</p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
