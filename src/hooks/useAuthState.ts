"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirstLogin: boolean | null;
  user: any;
  checkFirstLogin: () => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

export function useAuthState(): AuthState {
  const { data: session, status, update } = useSession();
  const [isFirstLogin, setIsFirstLogin] = useState<boolean | null>(null);
  const [isCheckingFirstLogin, setIsCheckingFirstLogin] = useState(false);

  const checkFirstLogin = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setIsFirstLogin(null);
      return;
    }

    setIsCheckingFirstLogin(true);
    
    try {
      const response = await fetch("/api/auth/check-first-login", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsFirstLogin(data.firstLogin);
      } else {
        console.error(`[AUTH_STATE] Error checking first login: ${response.status}`);
        setIsFirstLogin(null);
      }
    } catch (error) {
      console.error("[AUTH_STATE] Error checking first login:", error);
      setIsFirstLogin(null);
    } finally {
      setIsCheckingFirstLogin(false);
    }
  }, [status, session?.user?.id, session?.user?.email]);

  const refreshAuthState = useCallback(async () => {
    await update();
    await checkFirstLogin();
  }, [update, checkFirstLogin]);

  useEffect(() => {
    if (status === "authenticated") {
      checkFirstLogin();
    } else {
      setIsFirstLogin(null);
    }
  }, [status, checkFirstLogin]);

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || isCheckingFirstLogin,
    isFirstLogin,
    user: session?.user || null,
    checkFirstLogin,
    refreshAuthState,
  };
} 