"use client";

import { useState, useEffect } from "react";

/* Client-side hook die de ingelogde user ophaalt via /api/auth/me.
   Geeft { user, loading, logout }. */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUser(data.user || null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  }

  return { user, loading, logout };
}
