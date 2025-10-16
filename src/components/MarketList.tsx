"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Heart, HeartOff, Search, Filter } from "lucide-react";
import Image from "next/image";

interface Coin {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
  sparkline_in_7d: { price: number[] };
}

export default function MarketList() {
  const router = useRouter();
  const [coins, setCoins] = useState<Coin[]>([]);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const coinsPerPage = 20;
  const [showFilter, setShowFilter] = useState(false);

  // ✅ Fetch coins through your internal API route
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/markets"); // ✅ using your Next.js route
        setCoins(res.data);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchData();
  }, []);

  // Load favorites
  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem("watchlist", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // Filter logic
  const filteredCoins = coins
    .filter(
      (coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .filter((coin) => {
      if (filter === "Top Gainers") return coin.price_change_percentage_24h > 0;
      if (filter === "Top Losers") return coin.price_change_percentage_24h < 0;
      if (filter === "Market Cap") return coin.market_cap > 1000000000;
      return true;
    });

  // Pagination
  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
  const startIndex = (page - 1) * coinsPerPage;
  const displayedCoins = filteredCoins.slice(startIndex, startIndex + coinsPerPage);

  const handleRowClick = (id: string) => {
    router.push(`/coin/${id}`);
  };

  return (
    <div className="text-white px-4 sm:px-8 py-10">
      {/* Title */}
      <div className="text-center mb-10 px-2">
        <h1 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x leading-tight">
          💹 Live Market Overview
        </h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base tracking-wide max-w-lg mx-auto">
          Track real-time cryptocurrency prices and performance trends.
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8 w-full">
        <div className="flex items-center w-full sm:w-[300px] bg-[#1b1f2a] px-4 py-2 rounded-lg">
          <Search className="text-gray-400 mr-2 w-4 h-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search coin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent w-full text-sm outline-none text-white placeholder-gray-400"
          />
        </div>

        <div className="relative w-full sm:w-auto flex justify-end">
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center justify-center bg-[#1b1f2a] px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-yellow-400 transition w-full sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" /> {filter}
          </button>

          {showFilter && (
            <div className="absolute right-0 mt-2 bg-[#1b1f2a] rounded-lg border border-[#2a2e3b] w-40 shadow-lg z-20">
              {["All", "Top Gainers", "Top Losers", "Market Cap"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setFilter(item);
                    setShowFilter(false);
                    setPage(1);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-[#2a2e3b] ${
                    filter === item ? "text-yellow-400" : "text-gray-300"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Market Table */}
      <div className="overflow-x-auto rounded-xl bg-[#0f1117]/60 backdrop-blur-md border border-[#2a2e3b]">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-[#2a2e3b] text-xs sm:text-sm">
              <th className="text-left p-3 sm:p-4">Coin</th>
              <th className="text-center p-3 sm:p-4">7d Chart</th>
              <th className="text-right p-3 sm:p-4">Price</th>
              <th className="text-right p-3 sm:p-4">24h</th>
              <th className="text-center p-3 sm:p-4">Fav</th>
            </tr>
          </thead>

          <tbody>
            {displayedCoins.map((coin) => (
              <tr
                key={coin.id}
                onClick={() => handleRowClick(coin.id)}
                className="border-b border-[#1e2230] hover:bg-[#1b1f2a] transition cursor-pointer"
              >
                <td className="flex items-center gap-3 p-3 sm:p-4">
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    width={32}
                    height={32}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-white text-sm sm:text-base">{coin.name}</p>
                    <p className="text-xs text-gray-400 uppercase">{coin.symbol}</p>
                  </div>
                </td>

                <td className="p-3 sm:p-4 w-[100px] sm:w-[150px]">
                  <ResponsiveContainer width="100%" height={40}>
                    <LineChart data={coin?.sparkline_in_7d?.price.map((p, i) => ({ i, p }))}>
                      <Line
                        type="monotone"
                        dataKey="p"
                        stroke={coin?.price_change_percentage_24h >= 0 ? "#10b981" : "#ef4444"}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </td>

                <td className="text-right p-3 sm:p-4 font-medium text-xs sm:text-sm">
                  ${coin.current_price.toLocaleString()}
                </td>

                <td
                  className={`text-right p-3 sm:p-4 font-medium text-xs sm:text-sm ${
                    coin.price_change_percentage_24h >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </td>

                <td
                  className="text-center p-3 sm:p-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(coin.id);
                  }}
                >
                  {favorites.includes(coin.id) ? (
                    <Heart className="text-yellow-400 cursor-pointer" fill="currentColor" />
                  ) : (
                    <HeartOff className="text-gray-500 cursor-pointer hover:text-yellow-400 transition" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 text-sm sm:text-base">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-lg border border-[#2a2e3b] ${
            page === 1
              ? "text-gray-500 cursor-not-allowed"
              : "text-yellow-400 hover:bg-[#1b1f2a]"
          }`}
        >
          Prev
        </button>
        <span className="text-gray-400">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className={`px-4 py-2 rounded-lg border border-[#2a2e3b] ${
            page === totalPages
              ? "text-gray-500 cursor-not-allowed"
              : "text-yellow-400 hover:bg-[#1b1f2a]"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
