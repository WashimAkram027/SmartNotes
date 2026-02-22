import type { LLMProvider } from "../types";

interface ProviderSelectorProps {
    provider: LLMProvider;
    onChange: (provider: LLMProvider) => void;
}

const providers: { value: LLMProvider; label: string; icon: string }[] = [
    { value: "openai", label: "OpenAI", icon: "⚡" },
    { value: "anthropic", label: "Claude", icon: "🧠" },
];

export default function ProviderSelector({ provider, onChange }: ProviderSelectorProps) {
    return (
        <div className="flex gap-2">
            {providers.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onChange(p.value)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer"
                    style={{
                        background:
                            provider === p.value
                                ? "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))"
                                : "var(--bg-input)",
                        color: provider === p.value ? "#fff" : "var(--text-secondary)",
                        border: `1px solid ${provider === p.value ? "transparent" : "var(--border)"}`,
                        boxShadow: provider === p.value ? "0 4px 20px var(--accent-glow)" : "none",
                    }}
                >
                    <span className="mr-1.5">{p.icon}</span>
                    {p.label}
                </button>
            ))}
        </div>
    );
}
