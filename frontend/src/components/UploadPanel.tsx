import { useState, useRef, useCallback } from "react";
import { useUpload } from "../hooks/useUpload";

export default function UploadPanel() {
    const { uploading, error, uploadPDF, uploadText } = useUpload();
    const [mode, setMode] = useState<"pdf" | "text">("pdf");
    const [dragActive, setDragActive] = useState(false);
    const [textContent, setTextContent] = useState("");
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === "dragenter" || e.type === "dragover");
    }, []);

    const handleDrop = useCallback(
        async (e: React.DragEvent) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files[0];
            if (file) await handleFileUpload(file);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const handleFileUpload = async (file: File) => {
        setSuccessMsg(null);
        const result = await uploadPDF(file);
        if (result) {
            setSuccessMsg(result.message);
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    };

    const handleTextSubmit = async () => {
        if (!textContent.trim()) return;
        setSuccessMsg(null);
        const result = await uploadText(textContent);
        if (result) {
            setSuccessMsg(result.message);
            setTextContent("");
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    };

    return (
        <div
            className="rounded-2xl p-5"
            style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
            }}
        >
            <h3
                className="text-lg font-bold mb-4"
                style={{
                    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                📤 Upload Documents
            </h3>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
                {(["pdf", "text"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                        style={{
                            background: mode === m ? "var(--accent-primary)" : "var(--bg-input)",
                            color: mode === m ? "#fff" : "var(--text-secondary)",
                            border: `1px solid ${mode === m ? "transparent" : "var(--border)"}`,
                        }}
                    >
                        {m === "pdf" ? "📄 PDF File" : "✏️ Plain Text"}
                    </button>
                ))}
            </div>

            {mode === "pdf" ? (
                /* Drop Zone */
                <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl p-8 text-center cursor-pointer transition-all duration-200"
                    style={{
                        border: `2px dashed ${dragActive ? "var(--accent-primary)" : "var(--border)"}`,
                        background: dragActive ? "rgba(124,92,252,0.05)" : "var(--bg-input)",
                    }}
                >
                    <div className="text-4xl mb-2">{uploading ? "⏳" : "📁"}</div>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {uploading ? "Uploading..." : "Drop a PDF here or click to browse"}
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                        }}
                    />
                </div>
            ) : (
                /* Text Input */
                <div className="space-y-3">
                    <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Paste or type notes here..."
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none transition-all"
                        style={{
                            background: "var(--bg-input)",
                            color: "var(--text-primary)",
                            border: "1px solid var(--border)",
                        }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                    />
                    <button
                        onClick={handleTextSubmit}
                        disabled={uploading || !textContent.trim()}
                        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                            color: "#fff",
                        }}
                    >
                        {uploading ? "Uploading..." : "Upload Text"}
                    </button>
                </div>
            )}

            {/* Feedback Messages */}
            {successMsg && (
                <div
                    className="mt-3 text-xs rounded-lg p-2.5 animate-fade-up"
                    style={{ background: "rgba(52,211,153,0.1)", color: "var(--success)" }}
                >
                    ✅ {successMsg}
                </div>
            )}
            {error && (
                <div
                    className="mt-3 text-xs rounded-lg p-2.5"
                    style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}
                >
                    ❌ {error}
                </div>
            )}
        </div>
    );
}
