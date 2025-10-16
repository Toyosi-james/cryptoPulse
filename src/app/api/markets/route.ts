import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false",
      {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Next.js App (https://yourdomain.com)", // 👈 Important header
        },
        next: { revalidate: 60 }, // optional caching (revalidates every 60s)
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Fetch failed:", res.status, errText);
      return NextResponse.json(
        { error: "Failed to fetch markets" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching market data:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
