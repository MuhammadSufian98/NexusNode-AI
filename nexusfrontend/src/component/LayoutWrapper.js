"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/header-footer/header";
import Footer from "@/app/header-footer/footer";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

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
