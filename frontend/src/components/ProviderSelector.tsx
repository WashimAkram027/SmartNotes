import type { LLMProvider } from "../types";

interface ProviderSelectorProps {
    provider: LLMProvider;
    onChange: (provider: LLMProvider) => void;
}

const providers: { value: LLMProvider; label: string }[] = [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Claude" },
];

export default function ProviderSelector({ provider, onChange }: ProviderSelectorProps) {
    return (
        <div className="flex gap-3 items-center justify-center w-full">
            {providers.map((p) => {
                const isActive = provider === p.value;
                const isOpenAI = p.value === "openai";

                let classes: string;
                if (isActive && isOpenAI) {
                    classes =
                        "bg-gradient-to-r from-[#00c6ff] to-[#0072ff] shadow-[0px_0px_10px_0px_rgba(0,198,255,0.5)] text-white";
                } else if (isActive) {
                    classes =
                        "bg-gradient-to-r from-[#D97757] to-[#C45E3D] shadow-[0px_0px_10px_0px_rgba(217,119,87,0.5)] text-white";
                } else {
                    classes =
                        "bg-transparent border border-[rgba(255,255,255,0.1)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)]";
                }

                return (
                    <button
                        key={p.value}
                        onClick={() => onChange(p.value)}
                        className={`flex-1 py-[9px] px-4 text-[14px] rounded-full transition-all duration-200 cursor-pointer ${classes}`}
                    >
                        {p.label}
                    </button>
                );
            })}
        </div>
    );
}
