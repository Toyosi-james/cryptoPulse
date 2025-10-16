"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ✅ Define proper type instead of "any"
interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function WatchlistPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const router = useRouter();

  const fetchCoins = useCallback(async () => {
    try {
      // const res = await fetch("/api/markets");

      const baseUrl =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    : "";
const res = await fetch(`${baseUrl}/api/markets`);

      if (!res.ok) throw new Error("API request failed");
      const data: Coin[] = await res.json();
      setCoins(data);
    } catch (err) {
      console.error("Error fetching coins:", err);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
    const saved = localStorage?.getItem("watchlist");
    if (saved) setWatchlist(JSON?.parse(saved));
  }, [fetchCoins]);

  const handleRemove = (id: string) => {
    const updated = watchlist?.filter((coinId) => coinId !== id);
    setWatchlist(updated);
    localStorage?.setItem("watchlist", JSON?.stringify(updated));
  };

  const filtered = coins?.filter((coin) => watchlist?.includes(coin?.id));

  return (
    <main className="min-h-screen bg-[#0d0f12] text-white p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Your Watchlist
        </h2>

        <button
          onClick={() => router.push("/")}
          className="mt-4 sm:mt-0 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm sm:text-base transition-all shadow-md hover:shadow-blue-500/30"
        >
          ← Back to Home
        </button>
      </div>

      {filtered?.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-24 text-center">
          <p className="text-gray-400 text-lg sm:text-xl">
            You haven’t added any coins yet.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Go to the Market page to add your favorite coins 🚀
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered?.map((coin: Coin) => (
            <div
              key={coin?.id}
              onClick={() => router.push(`/coin/${coin?.id}`)}
              className="group relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-blue-400/30 p-6 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={coin?.image || "/placeholder.png"}
                  alt={coin?.name}
                  width={56}
                  height={56}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full group-hover:scale-110 transition-transform"
                />
                <div>
                  <h3 className="font-bold text-lg sm:text-xl text-white">
                    {coin?.name}
                  </h3>
                  <p className="text-gray-400 text-sm uppercase">
                    {coin?.symbol}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl sm:text-2xl font-semibold text-white">
                    ${coin?.current_price?.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm ${
                      coin?.price_change_percentage_24h > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {coin?.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(coin?.id);
                  }}
                  className="text-red-500 hover:text-red-400 text-2xl font-bold transition"
                  title="Remove from Watchlist"
                >
                  ✕
                </button>
              </div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
