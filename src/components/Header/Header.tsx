"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-lg transition-all duration-300 ${
        isScrolled ? "bg-white/10 shadow-lg" : "bg-white/5"
      }`}
    >
      <nav className="flex items-center justify-between px-10 py-4">
        {/* Logo */}
        <Link href="/marketlist" className="flex flex-col leading-tight">
          <span className="text-2xl font-bold text-blue-400 hover:text-blue-500 transition mt-2 ">
            CryptoPulse
          </span>
          <span className="text-xs text-white/60 tracking-wider mt-2">Live Market</span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          {/* <Link
            href="/Marketlist"
            className={`${
              pathname === "/marketlist" ? "text-blue-400" : "text-white/70 hover:text-white"
            } font-medium transition`}
          >
            Market
          </Link> */}

          <Link
            href="/watchlist"
            className={`${
              pathname === "/watchlist" ? "text-blue-400" : "text-white hover:text-white"
            } font-medium transition  px-4 py-2 rounded-lg backdrop-blur-md bg-blue-600`}
          >
            Watchlist
          </Link>
        </div>
      </nav>
    </header>
  );
}
