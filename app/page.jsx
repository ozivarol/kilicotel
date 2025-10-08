"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const response = await fetch("/api/auth/check");
      const data = await response.json();

      if (data.authenticated) {
        router.push("/odalar");
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6943b8]"></div>
    </div>
  );
}
