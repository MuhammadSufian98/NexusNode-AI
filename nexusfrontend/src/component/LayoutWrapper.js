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
    <>
      {!isDashboard && <Header />}

      <main className="grow relative">{children}</main>

      {!isDashboard && <Footer />}
    </>
  );
}
