export const getCoins = async () => {
  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true"
  );
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};
