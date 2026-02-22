import { useState, useRef, useEffect } from "react";
import type { ChatMessage, LLMProvider } from "../types";
import { useQuery } from "../hooks/useQuery";

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

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-up">
                        <div className="text-6xl mb-4">📚</div>
                        <h2
                            className="text-2xl font-bold mb-2"
                            style={{
                                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                        >
                            Smart Notes
                        </h2>
                        <p style={{ color: "var(--text-secondary)" }}>
                            Upload documents and ask questions about them.
                        </p>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div
                        key={msg.id}
                        className="animate-fade-up"
                        style={{ animationDelay: `${i * 0.05}s` }}
                    >
                        <div
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className="max-w-[75%] rounded-2xl px-5 py-3.5"
                                style={{
                                    background:
                                        msg.role === "user"
                                            ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))"
                                            : "var(--bg-card)",
                                    border: msg.role === "assistant" ? "1px solid var(--border)" : "none",
                                    boxShadow:
                                        msg.role === "user"
                                            ? "0 4px 20px var(--accent-glow)"
                                            : "0 2px 10px rgba(0,0,0,0.2)",
                                }}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                                {msg.role === "assistant" && msg.model && (
                                    <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                                        <span
                                            className="px-2 py-0.5 rounded-full"
                                            style={{ background: "var(--bg-input)" }}
                                        >
                                            {msg.provider} / {msg.model}
                                        </span>
                                    </div>
                                )}

                                {msg.sources && msg.sources.length > 0 && (
                                    <details className="mt-3">
                                        <summary
                                            className="text-xs cursor-pointer"
                                            style={{ color: "var(--accent-secondary)" }}
                                        >
                                            📄 {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""} cited
                                        </summary>
                                        <div className="mt-2 space-y-1.5">
                                            {msg.sources.map((src, j) => (
                                                <div
                                                    key={j}
                                                    className="text-xs rounded-lg p-2"
                                                    style={{
                                                        background: "var(--bg-input)",
                                                        color: "var(--text-secondary)",
                                                    }}
                                                >
                                                    <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                                                        {src.source}
                                                        {src.page != null && ` (p. ${src.page + 1})`}
                                                    </div>
                                                    <p className="mt-0.5 line-clamp-2">{src.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div
                            className="loading-shimmer rounded-2xl px-5 py-3.5"
                            style={{ width: "200px", height: "48px" }}
                        />
                    </div>
                )}

                {error && (
                    <div
                        className="text-sm text-center rounded-lg p-3"
                        style={{ background: "rgba(248,113,113,0.1)", color: "var(--error)" }}
                    >
                        {error}
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSubmit}
                className="p-4 border-t flex gap-3"
                style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
            >
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    disabled={loading}
                    className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200"
                    style={{
                        background: "var(--bg-input)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border)",
                    }}
                    onFocus={(e) =>
                        (e.currentTarget.style.borderColor = "var(--accent-primary)")
                    }
                    onBlur={(e) =>
                        (e.currentTarget.style.borderColor = "var(--border)")
                    }
                />
                <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                        color: "#fff",
                        boxShadow: "0 4px 20px var(--accent-glow)",
                    }}
                >
                    {loading ? "..." : "Send"}
                </button>
            </form>
        </div>
    );
}
