import { useCallback, useEffect, useState } from "react";

type Account = { name: string; email: string; phone_number: string } | null;

export default function useAccount(apiKey?: string) {
  const [account, setAccount] = useState<Account>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccount = useCallback(async (signal?: AbortSignal) => {
    if (!apiKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: apiKey }),
        signal,
      });

      if (!res.ok) throw new Error("Could not fetch account");
      const data = await res.json();
      setAccount(data);
    } catch (err: any) {
      if (err && err.name === "AbortError") return;
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    const controller = new AbortController();
    fetchAccount(controller.signal);
    return () => controller.abort();
  }, [fetchAccount]);

  return { account, loading, error, refetch: fetchAccount } as const;
}