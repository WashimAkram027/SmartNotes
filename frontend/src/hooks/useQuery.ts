import { useState, useCallback } from "react";
import type { LLMProvider, QueryResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

interface UseQueryReturn {
    loading: boolean;
    error: string | null;
    askQuestion: (question: string, provider: LLMProvider) => Promise<QueryResponse | null>;
}

export function useQuery(): UseQueryReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const askQuestion = useCallback(
        async (question: string, provider: LLMProvider): Promise<QueryResponse | null> => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${API_BASE}/api/query`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ question, provider }),
                });

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.error ?? `Server error (${res.status})`);
                }

                return (await res.json()) as QueryResponse;
            } catch (err) {
                const msg = err instanceof Error ? err.message : "Unknown error";
                setError(msg);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    return { loading, error, askQuestion };
}
