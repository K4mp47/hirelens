"use client";

import { useEffect } from "react";
import Script from "next/script";
import { usePuterStore } from "@/lib/puter";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const init = usePuterStore((state) => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />
      {children}
    </>
  );
}
