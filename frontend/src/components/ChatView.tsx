import { useState, useRef, useEffect } from "react";
import type { ChatMessage, LLMProvider } from "../types";
import { useQuery } from "../hooks/useQuery";
import svgPaths from "../assets/svg-paths";
import smartNotesLogo from "../assets/smart-notes-logo.png";

interface ChatViewProps {
    provider: LLMProvider;
}

export default function ChatView({ provider }: ChatViewProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const { loading, error, askQuestion } = useQuery();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const question = input.trim();
        if (!question || loading) return;

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");

        const response = await askQuestion(question, provider);
        if (response) {
            const assistantMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: response.answer,
                provider: response.provider,
                model: response.model,
                sources: response.sources,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMsg]);
        }
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="flex-1 flex flex-col h-full">
            {/* ── Messages or Hero Card ─────────────────────────────── */}
            <div className="flex-1 overflow-y-auto flex flex-col">
                {!hasMessages ? (
                    /* ── Hero Card — centered ───────────────────────── */
                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                        {/* Decorative purple background glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[rgba(112,0,255,0.2)] rounded-full blur-[100px] pointer-events-none" />

                        <div className="relative backdrop-blur-[10px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[24px] p-[49px] flex flex-col items-center gap-6 max-w-[672px] w-full shadow-2xl">
                            {/* Logo with gradient border */}
                            <div
                                className="w-[96px] h-[96px] rounded-[16px] p-px flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-[0px_0px_30px_0px_rgba(20,184,166,0.1)]"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%)",
                                }}
                            >
                                <div className="w-[80px] h-[80px] rounded-xl overflow-hidden shadow-[0px_0px_15px_0px_rgba(100,200,255,0.4)] flex items-center justify-center">
                                    <img
                                        src={smartNotesLogo}
                                        alt="Smart Notes Logo"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-[48px] font-semibold text-white text-center leading-[48px] tracking-[-1.2px] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                Smart Notes
                            </h2>

                            {/* Subtitle */}
                            <div className="flex flex-col gap-1 items-center text-center">
                                <p className="text-[18px] text-[#ccc] leading-[28px]">
                                    Upload documents and ask questions about
                                    them.
                                </p>
                                <p className="text-[18px] text-[#ccc] leading-[28px]">
                                    Experience the power of AI-driven analysis.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ── Chat Messages ──────────────────────────────── */
                    <div className="w-full max-w-4xl mx-auto p-6 space-y-4">
                        {messages.map((msg, i) => (
                            <div
                                key={msg.id}
                                className="animate-fade-up"
                                style={{ animationDelay: `${i * 0.03}s` }}
                            >
                                <div
                                    className={`flex ${
                                        msg.role === "user"
                                            ? "justify-end"
                                            : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-5 py-3.5 ${
                                            msg.role === "user"
                                                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                                                : "glass-panel text-slate-200"
                                        }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.content}
                                        </p>

                                        {/* Model badge */}
                                        {msg.role === "assistant" &&
                                            msg.model && (
                                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                                                        {msg.provider} /{" "}
                                                        {msg.model}
                                                    </span>
                                                </div>
                                            )}

                                        {/* Sources */}
                                        {msg.sources &&
                                            msg.sources.length > 0 && (
                                                <details className="mt-3">
                                                    <summary className="text-xs cursor-pointer text-blue-400 hover:text-blue-300 transition-colors">
                                                        <span className="material-icons-round text-xs align-middle mr-1">
                                                            description
                                                        </span>
                                                        {msg.sources.length}{" "}
                                                        source
                                                        {msg.sources.length > 1
                                                            ? "s"
                                                            : ""}{" "}
                                                        cited
                                                    </summary>
                                                    <div className="mt-2 space-y-1.5">
                                                        {msg.sources.map(
                                                            (src, j) => (
                                                                <div
                                                                    key={j}
                                                                    className="text-xs rounded-lg p-2 bg-white/5 border border-white/10 text-slate-400"
                                                                >
                                                                    <div className="font-medium text-slate-300">
                                                                        {
                                                                            src.source
                                                                        }
                                                                        {src.page !=
                                                                            null &&
                                                                            ` (p. ${src.page + 1})`}
                                                                    </div>
                                                                    <p className="mt-0.5 line-clamp-2">
                                                                        {
                                                                            src.content
                                                                        }
                                                                    </p>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </details>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Loading shimmer */}
                        {loading && (
                            <div className="flex justify-start animate-fade-up">
                                <div
                                    className="loading-shimmer glass-panel rounded-2xl px-5 py-3.5"
                                    style={{
                                        width: "220px",
                                        height: "52px",
                                    }}
                                />
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="text-sm text-center rounded-xl p-3 bg-red-500/10 text-red-400 border border-red-500/20">
                                <span className="material-icons-round text-sm mr-2 align-middle">
                                    warning
                                </span>
                                {error}
                            </div>
                        )}

                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* ── Bottom Chat Input ──────────────────────────────────── */}
            <div className="pb-12 pt-8 px-8 w-full flex justify-center relative z-20">
                <div className="w-full max-w-[672px] flex flex-col gap-4">
                    <form onSubmit={handleSubmit}>
                        <div className="w-full backdrop-blur-[5px] bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-[12px] p-[9px] pl-[21px] flex items-center gap-3">
                            {/* Sparkle icon */}
                            <div className="w-4 h-4 shrink-0">
                                <svg
                                    className="w-full h-full"
                                    fill="none"
                                    viewBox="0 0 16.31 16.31"
                                >
                                    <path
                                        d={svgPaths.sparkle}
                                        fill="#6B7280"
                                    />
                                </svg>
                            </div>

                            {/* Text input */}
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question about your documents..."
                                disabled={loading}
                                className="flex-1 bg-transparent border-none outline-none text-[16px] text-white placeholder-[rgba(255,255,255,0.5)]"
                            />

                            {/* Send button */}
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-[10px] rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,122,255,0.5)] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                            >
                                {loading ? (
                                    <span className="material-icons-round text-xl animate-spin">
                                        autorenew
                                    </span>
                                ) : (
                                    <div className="w-5 h-5">
                                        <svg
                                            className="w-full h-full"
                                            fill="none"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                d={svgPaths.send}
                                                stroke="white"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="1.66667"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                    <p className="text-center text-[10px] text-[#4b5563]">
                        AI can make mistakes. Please verify important
                        information.
                    </p>
                </div>
            </div>
        </div>
    );
}
