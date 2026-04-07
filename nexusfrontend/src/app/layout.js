import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LayoutWrapper from "@/component/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: "NexusNode AI | Neural Document Intelligence",
  description:
    "Advanced RAG system for interacting with PDFs using neural vector mapping.",
  keywords: ["AI", "PDF Chat", "RAG", "NexusNode", "Neural Retrieval"],
  authors: [{ name: "Sufian" }],
  icons: {
    icon: "/favicon/logo.png",
    shortcut: "/favicon/logo.png",
    apple: "/favicon/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon/logo.png" sizes="any" />
        <link rel="shortcut icon" href="/favicon/logo.png" />
        <link rel="apple-touch-icon" href="/favicon/logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-slate-50`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
