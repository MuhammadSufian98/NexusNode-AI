"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "@/app/header-footer/header";
import Footer from "@/app/header-footer/footer";
import { useAuth } from "@/store/authStore";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const hydrateSession = useAuth((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const isDashboard =
    pathname.startsWith("/dashboard") || pathname.startsWith("/auth/login");

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Header (Excluded on Dashboard and Login screens) */}
      {!isDashboard && <Header />}

      {/* 
        2. Main Content Container:
        - pt-20 sm:pt-24 pushes the entire page down cleanly below the fixed header 
        - isDashboard resets to pt-0 so custom sidebar/workspace layouts can use 100vh directly
      */}
      <main
        className={`grow relative w-full ${
          !isDashboard ? "pt-20 sm:pt-24" : "pt-0"
        }`}
      >
        {children}
      </main>

      {/* 3. Footer */}
      {!isDashboard && <Footer />}
    </div>
  );
}
