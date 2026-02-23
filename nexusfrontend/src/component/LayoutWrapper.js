"use client";

import { usePathname } from "next/navigation";
import Header from "@/app/header-footer/header";
import Footer from "@/app/header-footer/footer";
import { GlobalProvider } from "@/context/globalContext";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isDashboard = pathname.startsWith("/dashboard");

  return (
    <GlobalProvider>
      {!isDashboard && <Header />}

      <main className="grow relative">{children}</main>

      {!isDashboard && <Footer />}
    </GlobalProvider>
  );
}
