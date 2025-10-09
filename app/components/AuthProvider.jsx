"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    runAutoCheckout();
  }, []);

  useEffect(() => {
    if (pathname !== "/login") {
      checkAuth();
    }
  }, [pathname]);

  const checkAuth = async () => {
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (!data.authenticated) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    } catch (error) {
      router.push("/login");
    }
  };

  const runAutoCheckout = async () => {
    try {
      await fetch("/api/auto-checkout", { method: "POST" });
    } catch (error) {
      console.error("Auto-checkout failed:", error);
    }
  };

  if (loading && pathname !== "/login") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6943b8]"></div>
      </div>
    );
  }

  return <>{children}</>;
}
