"use client"; // We need this to use usePathname

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import Header from "./header-footer/header";
import Footer from "./header-footer/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();

  // Define routes where Header and Footer should be hidden
  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Only render Header if NOT on dashboard */}
        {!isDashboard && <Header />}

        <main className="grow relative">{children}</main>

        {/* Only render Footer if NOT on dashboard */}
        {!isDashboard && <Footer />}
      </body>
    </html>
  );
}
