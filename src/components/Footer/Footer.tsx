"use client";

export default function Footer() {
  return (
    <footer className="border-t border-gray-600 bg-transparent text-white py-8 mt-10 sm:py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 text-center sm:text-left space-y-4 sm:space-y-0">
        {/* Logo Section */}
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <div className="text-blue-600 text-2xl sm:text-3xl font-extrabold tracking-wide">
            CryptoPulse
          </div>
        </div>

        {/* Copyright */}
        <p className="text-sm sm:text-md font-semibold text-gray-300">
          © {new Date().getFullYear()} CryptoPulse Live. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
