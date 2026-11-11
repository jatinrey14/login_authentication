"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

interface AuthGuardOptions {
  requireAuth?: boolean;
}

export function useAuthGuard(options: AuthGuardOptions = {}) {
  const { requireAuth = true } = options;
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const userIsAuth = isAuthenticated();

    if (requireAuth && !userIsAuth) {
      router.replace("/login");
    } else if (!requireAuth && userIsAuth) {
      router.replace("/dashboard");
    } else {
      setIsChecking(false);
    }
  }, [requireAuth, router]);

  return { isChecking };
}