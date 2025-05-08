"use client";

import { useRouter } from "next/navigation";

import { useEffect } from "react";

const page = () => {
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          router.push("/gallery");
        }
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24"></main>
  );
};
export default page;
