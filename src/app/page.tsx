import Header from "../components/Header/Header";
import StatCards from "@/components/StatCards";
import MarketList from "../components/MarketList";
import Footer from "../components/Footer/Footer"

export default function page() {
  return (
    <main className="min-h-screen bg-[#0d0f12] text-white px-8 py-6">
      <Header />
      <StatCards />
      <MarketList />
      <Footer/>

    </main>
  );
}
