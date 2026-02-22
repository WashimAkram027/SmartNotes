import { useState, useCallback } from "react";
import type { DocumentUploadResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

interface UseUploadReturn {
    uploading: boolean;
    error: string | null;
    uploadPDF: (file: File) => Promise<DocumentUploadResponse | null>;
    uploadText: (text: string) => Promise<DocumentUploadResponse | null>;
}

export function useUpload(): UseUploadReturn {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const uploadPDF = useCallback(async (file: File): Promise<DocumentUploadResponse | null> => {
        setUploading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch(`${API_BASE}/api/documents/upload`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? `Upload failed (${res.status})`);
            }

            return (await res.json()) as DocumentUploadResponse;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Upload failed";
            setError(msg);
            return null;
        } finally {
            setUploading(false);
        }
    }, []);

    const uploadText = useCallback(async (text: string): Promise<DocumentUploadResponse | null> => {
        setUploading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/documents/text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? `Text upload failed (${res.status})`);
            }

            return (await res.json()) as DocumentUploadResponse;
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Upload failed";
            setError(msg);
            return null;
        } finally {
            setUploading(false);
        }
    }, []);

    return { uploading, error, uploadPDF, uploadText };
}
