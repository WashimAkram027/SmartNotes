import { useState, useRef, useCallback } from "react";
import { useUpload } from "../hooks/useUpload";
import svgPaths from "../assets/svg-paths";

interface UploadedFile {
    name: string;
    timestamp: Date;
}

export default function UploadPanel() {
    const { uploading, error, uploadPDF, uploadText } = useUpload();
    const [mode, setMode] = useState<"pdf" | "text">("pdf");
    const [dragActive, setDragActive] = useState(false);
    const [textContent, setTextContent] = useState("");
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [recentFiles, setRecentFiles] = useState<UploadedFile[]>([]);
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
            setRecentFiles((prev) => [
                { name: file.name, timestamp: new Date() },
                ...prev.filter((f) => f.name !== file.name),
            ]);
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    };

    const handleTextSubmit = async () => {
        if (!textContent.trim()) return;
        setSuccessMsg(null);
        const result = await uploadText(textContent);
        if (result) {
            setSuccessMsg(result.message);
            setRecentFiles((prev) => [
                { name: "text_note.txt", timestamp: new Date() },
                ...prev,
            ]);
            setTextContent("");
            setTimeout(() => setSuccessMsg(null), 5000);
        }
    };

    return (
        <>
            {/* ── Upload Documents Section ─────────────────────────── */}
            <div className="flex flex-col gap-3 items-start w-full">
                <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-[0.5px] leading-[15px]">
                    Upload Documents
                </div>

                {/* Upload Mode Cards */}
                <div className="flex gap-[10px] items-start justify-center w-full">
                    {/* PDF Button */}
                    <button
                        onClick={() => {
                            setMode("pdf");
                            fileInputRef.current?.click();
                        }}
                        disabled={uploading}
                        className="group flex flex-1 flex-col gap-2 items-center justify-center py-[37px] rounded-[16px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <div className="w-8 h-8 shrink-0">
                            <svg
                                className="w-full h-full transition-transform group-hover:scale-110"
                                fill="none"
                                viewBox="0 0 32 32"
                            >
                                <path
                                    d={svgPaths.pdfFile}
                                    stroke="#F87171"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeOpacity="0.8"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                        <span className="text-[12px] text-[#9ca3af]">
                            {uploading && mode === "pdf"
                                ? "Uploading..."
                                : "PDF File"}
                        </span>
                    </button>

                    {/* Plain Text Button */}
                    <button
                        onClick={() => setMode("text")}
                        className={`group flex flex-1 flex-col gap-2 items-center justify-center py-[37px] rounded-[16px] transition-colors cursor-pointer ${
                            mode === "text"
                                ? "bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)]"
                                : "bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.1)]"
                        }`}
                    >
                        <div className="w-8 h-8 shrink-0">
                            <svg
                                className="w-full h-full transition-transform group-hover:scale-110"
                                fill="none"
                                viewBox="0 0 32 32"
                            >
                                <path
                                    d={svgPaths.textDoc}
                                    stroke="#9CA3AF"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                />
                            </svg>
                        </div>
                        <span className="text-[12px] text-[#9ca3af]">
                            Plain Text
                        </span>
                    </button>
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                        e.target.value = "";
                    }}
                />

                {mode === "pdf" ? (
                    /* Drag and Drop Area */
                    <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`bg-[rgba(0,0,0,0.2)] border-2 border-dashed rounded-[16px] h-[104px] w-full flex flex-col items-center justify-center transition-colors cursor-pointer ${
                            dragActive
                                ? "border-[rgba(255,255,255,0.4)]"
                                : "border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
                        }`}
                    >
                        {uploading ? (
                            <span className="material-icons-round text-2xl text-blue-300 animate-spin mb-1">
                                autorenew
                            </span>
                        ) : (
                            <div className="bg-[rgba(255,255,255,0.05)] rounded-[12px] w-10 h-10 flex items-center justify-center mb-2">
                                <div className="w-8 h-8 shadow-[0px_0px_5px_0px_rgba(0,229,255,0.5)] rounded-full">
                                    <svg
                                        className="w-full h-full"
                                        fill="none"
                                        viewBox="0 0 32 32"
                                    >
                                        <path
                                            d={svgPaths.folder}
                                            stroke="#00E5FF"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                        <div className="text-[14px] text-[#d1d5db] text-center mb-1">
                            {uploading ? "Processing..." : "Drag & drop files"}
                        </div>
                        {!uploading && (
                            <div className="text-[10px] text-[#6b7280] text-center">
                                or click to browse
                            </div>
                        )}
                    </div>
                ) : (
                    /* Text Input */
                    <div className="space-y-3 w-full">
                        <textarea
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                            placeholder="Paste or type notes here..."
                            rows={4}
                            className="glass-input w-full px-4 py-3 rounded-xl text-sm text-white resize-none transition-all placeholder-[rgba(255,255,255,0.5)]"
                        />
                        <button
                            onClick={handleTextSubmit}
                            disabled={uploading || !textContent.trim()}
                            className="w-full py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-white bg-gradient-to-r from-[#00c6ff] to-[#0072ff] shadow-[0px_0px_10px_0px_rgba(0,198,255,0.3)] hover:shadow-[0px_0px_15px_0px_rgba(0,198,255,0.5)]"
                        >
                            {uploading ? "Uploading..." : "Upload Text"}
                        </button>
                    </div>
                )}

                {/* Feedback Messages */}
                {successMsg && (
                    <div className="w-full text-xs rounded-lg p-2.5 animate-fade-up bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="material-icons-round text-xs mr-1 align-middle">
                            check_circle
                        </span>
                        {successMsg}
                    </div>
                )}
                {error && (
                    <div className="w-full text-xs rounded-lg p-2.5 bg-red-500/10 text-red-400 border border-red-500/20">
                        <span className="material-icons-round text-xs mr-1 align-middle">
                            error
                        </span>
                        {error}
                    </div>
                )}
            </div>

            {/* ── Recent Files Section ─────────────────────────────── */}
            {recentFiles.length > 0 && (
                <div className="flex flex-col gap-3 items-start w-full">
                    <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-[0.5px] leading-[15px]">
                        Recent Files
                    </div>
                    <ul className="space-y-2 w-full">
                        {recentFiles.map((file, i) => (
                            <li
                                key={`${file.name}-${i}`}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.05)] cursor-pointer transition-colors group"
                            >
                                <span className="material-icons-round text-[#6b7280] text-sm group-hover:text-blue-400">
                                    article
                                </span>
                                <span className="text-sm text-[#d1d5db] truncate">
                                    {file.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}
