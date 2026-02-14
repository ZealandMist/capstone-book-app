"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect } from "react";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axios.get("/api/auth/profile");
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.replace("/login");
        }
      }
    };
    checkAuth();
  }, [router]);
}