"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// TypeScript interfaces
interface Coin {
  id: string;
  name: string;
  symbol: string;
  image?: { large: string };
  market_data?: {
    current_price?: { usd: number };
    price_change_percentage_24h?: number;
    market_cap?: { usd: number };
    high_24h?: { usd: number };
    low_24h?: { usd: number };
    circulating_supply?: number;
  };
  description?: { en?: string };
}

interface ChartPoint {
  time: string;
  price: number;
}

export default function CoinDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [coin, setCoin] = useState<Coin | null>(null);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const router = useRouter();

  // ✅ UseCallback makes these functions stable and removes warnings
  const fetchCoinDetails = useCallback(async () => {
    try {
      // const res = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
      const res = await fetch(`/api/coin/${id}`);

      const data: Coin = await res.json();
      setCoin(data);
    } catch (error) {
      console.error("Error fetching coin details:", error);
    }
  }, [id]);

  const fetchChartData = useCallback(async () => {
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`
      );
      const data = await res.json();
      const formatted: ChartPoint[] = data.prices.map((p: [number, number]) => ({
        time: new Date(p[0]).toLocaleDateString(),
        price: p[1],
      }));
      setChartData(formatted);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  }, [id]);

  // Watchlist toggle
  const toggleWatchlist = () => {
    let updated = [...watchlist];
    if (watchlist.includes(id)) {
      updated = updated.filter((coinId) => coinId !== id);
    } else {
      updated.push(id);
    }
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  };

  useEffect(() => {
    fetchCoinDetails();
    fetchChartData();
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, [id, fetchCoinDetails, fetchChartData]); // ✅ no more warning

  if (!coin)
    return (
      <div className="flex justify-center items-center h-screen text-gray-400 text-lg">
        Loading coin details...
      </div>
    );

  const isInWatchlist = watchlist.includes(id);

  // Safely get all market data values
  const currentPrice = coin.market_data?.current_price?.usd ?? 0;
  const priceChange = coin.market_data?.price_change_percentage_24h ?? 0;
  const marketCap = coin.market_data?.market_cap?.usd ?? 0;
  const high24h = coin.market_data?.high_24h?.usd ?? 0;
  const low24h = coin.market_data?.low_24h?.usd ?? 0;
  const circulatingSupply = coin.market_data?.circulating_supply ?? 0;

  return (
    <section className="min-h-screen bg-[#0d1117] text-gray-100 px-4 sm:px-6 lg:px-12 py-8 sm:py-12">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 text-sm sm:text-base font-medium text-blue-400 hover:text-blue-500 transition flex items-center gap-1"
      >
        ← Back to Market
      </button>

      {/* Coin Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <Image
            src={coin.image?.large || "/placeholder.png"}
            alt={coin.name}
            width={64}
            height={64}
            className="w-12 h-12 sm:w-16 sm:h-16"
          />
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wide text-white">
              {coin.name}
            </h1>
            <p className="text-gray-400 uppercase text-xs sm:text-sm tracking-wider">
              {coin.symbol}
            </p>
          </div>
        </div>

        {/* Price & Watchlist Button */}
        <div className="flex flex-col items-start lg:items-end gap-3">
          <div className="text-left lg:text-right">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white">
              ${currentPrice.toLocaleString()}
            </h2>
            <p
              className={`text-sm sm:text-base font-semibold ${
                priceChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {priceChange.toFixed(2)}%
            </p>
          </div>

          <button
            onClick={toggleWatchlist}
            className={`px-5 py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all shadow-md ${
              isInWatchlist
                ? "bg-red-800 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isInWatchlist ? "Remove Watchlist " : "Add to Watchlist ★"}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12">
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-5 sm:p-6 rounded-xl border border-[#2a2e3b] shadow-lg hover:scale-[1.02] transition-transform sm:text-sm">
          <p className="text-gray-400 text-xs sm:text-sm mb-2">Market Cap</p>
          <h3 className="text-lg sm:text-2xl font-semibold text-white break-words">
            ${marketCap.toLocaleString()}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#111827] p-5 sm:p-6 rounded-xl border border-[#2a2e3b] shadow-lg hover:scale-[1.02] transition-transform">
          <p className="text-gray-400 text-xs sm:text-sm mb-2">24h High / Low</p>
          <h3 className="text-lg sm:text-2xl font-semibold text-white break-words">
            ${high24h.toLocaleString()} / ${low24h.toLocaleString()}
          </h3>
        </div>

        <div className="bg-gradient-to-br from-[#16213e] to-[#1a1a2f] p-5 sm:p-6 rounded-xl border border-[#2a2e3b] shadow-lg hover:scale-[1.02] transition-transform">
          <p className="text-gray-400 text-xs sm:text-sm mb-2">Circulating Supply</p>
          <h3 className="text-lg sm:text-2xl font-semibold text-white break-words">
            {circulatingSupply.toLocaleString()} {coin.symbol.toUpperCase()}
          </h3>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#1b1e23]/80 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-[#2a2e3b]">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-white text-center sm:text-left">
          7-Day Price Trend
        </h3>
        <div className="w-full h-[230px] sm:h-[280px] md:h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" hide />
              <YAxis domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{
                  background: "#1b1e23",
                  border: "1px solid #2a2e3b",
                  borderRadius: "0.5rem",
                }}
                labelStyle={{ color: "#ccc" }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* About Section */}
      <div className="mt-10 bg-gradient-to-br from-[#111827] to-[#0f172a] backdrop-blur-md rounded-2xl shadow-lg p-5 sm:p-6 md:p-8 border border-[#2a2e3b]">
        <h3 className="font-semibold text-2xl sm:text-3xl mb-3 sm:mb-4 text-white text-center sm:text-left">
          About {coin.name}
        </h3>
        <p
          className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed text-justify"
          dangerouslySetInnerHTML={{
            __html:
              coin.description?.en?.slice(0, 600) ?? "No description available.",
          }}
        />
      </div>
    </section>
  );
}
