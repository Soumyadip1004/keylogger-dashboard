"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "apiKey";

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApiKey(stored);
      setIsReady(true);
    }
  }, []);

  const login = useCallback((key: string) => {
    const trimmed = key.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setApiKey(trimmed);
      setIsReady(true);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey("");
    setIsReady(false);
  }, []);

  /** Shorthand headers object for fetch calls. */
  const authHeaders = apiKey ? { "x-api-key": apiKey } : undefined;

  return {
    apiKey,
    isReady,
    /** True when we've checked localStorage but no key was found and none has been set. */
    needsAuth: !isReady && !apiKey,
    login,
    logout,
    authHeaders,
  } as const;
}
