import { useState } from "react";
import ChatView from "./components/ChatView";
import UploadPanel from "./components/UploadPanel";
import ProviderSelector from "./components/ProviderSelector";
import type { LLMProvider } from "./types";
import smartNotesLogo from "./assets/smart-notes-logo.png";

const BG_STYLE = {
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 1470 1076\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"none\"><rect x=\"0\" y=\"0\" height=\"100%\" width=\"100%\" fill=\"url(%23grad)\" opacity=\"1\"/><defs><radialGradient id=\"grad\" gradientUnits=\"userSpaceOnUse\" cx=\"0\" cy=\"0\" r=\"10\" gradientTransform=\"matrix(188.25 0 0 172.24 0 0)\"><stop stop-color=\"rgba(45,20,85,0.8)\" offset=\"0\"/><stop stop-color=\"rgba(45,20,85,0)\" offset=\"0.6\"/></radialGradient></defs></svg>'), url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 1470 1076\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"none\"><rect x=\"0\" y=\"0\" height=\"100%\" width=\"100%\" fill=\"url(%23grad)\" opacity=\"1\"/><defs><radialGradient id=\"grad\" gradientUnits=\"userSpaceOnUse\" cx=\"0\" cy=\"0\" r=\"10\" gradientTransform=\"matrix(118.52 0 0 108.44 441 538)\"><stop stop-color=\"rgba(100,50,200,0.25)\" offset=\"0\"/><stop stop-color=\"rgba(100,50,200,0)\" offset=\"0.4\"/></radialGradient></defs></svg>'), url('data:image/svg+xml;utf8,<svg viewBox=\"0 0 1470 1076\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"none\"><rect x=\"0\" y=\"0\" height=\"100%\" width=\"100%\" fill=\"url(%23grad)\" opacity=\"1\"/><defs><radialGradient id=\"grad\" gradientUnits=\"userSpaceOnUse\" cx=\"0\" cy=\"0\" r=\"10\" gradientTransform=\"matrix(188.25 0 0 172.24 1470 1076)\"><stop stop-color=\"rgba(40,60,140,0.8)\" offset=\"0\"/><stop stop-color=\"rgba(40,60,140,0)\" offset=\"0.6\"/></radialGradient></defs></svg>'), linear-gradient(90deg, rgb(11, 11, 21) 0%, rgb(11, 11, 21) 100%)",
  backgroundSize: "cover",
  backgroundPosition: "center",
} as const;

export default function App() {
  const [provider, setProvider] = useState<LLMProvider>("openai");

  return (
    <div
      className="h-screen w-full flex overflow-hidden antialiased text-white font-sans selection:bg-purple-500 selection:text-white"
      style={BG_STYLE}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-[320px] h-full backdrop-blur-[10px] bg-[rgba(255,255,255,0.03)] flex flex-col justify-between p-[25px] shrink-0 relative z-20 border-r border-[rgba(255,255,255,0.08)]">
        {/* Top Section: Header & Controls */}
        <div className="flex flex-col gap-8 items-start w-full overflow-y-auto">
          {/* App Header */}
          <div className="flex items-center gap-4">
            <div className="w-[48px] h-[48px] shrink-0 flex items-start">
              <div className="w-[32px] h-[32px] shadow-[0px_0px_8px_0px_rgba(255,255,255,0.5)]">
                <img
                  alt="Smart Notes Logo"
                  className="w-full h-full object-cover"
                  src={smartNotesLogo}
                />
              </div>
            </div>
            <div>
              <h1 className="text-[20px] font-semibold tracking-[0.5px] leading-[28px] text-white">
                Smart Notes
              </h1>
              <p className="text-[12px] text-[#9ca3af] leading-[16px]">
                AI-Powered Document Q&A
              </p>
            </div>
          </div>

          {/* LLM Provider */}
          <div className="flex flex-col gap-3 items-start w-full">
            <div className="text-[10px] font-semibold text-[#6b7280] uppercase tracking-[0.5px] leading-[15px]">
              LLM Provider
            </div>
            <ProviderSelector
              provider={provider}
              onChange={setProvider}
            />
          </div>

          {/* Upload Section + Recent Files */}
          <UploadPanel />
        </div>

        {/* Limitations & Future Improvements */}
        <div className="w-full pt-[25px] border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex flex-col gap-3 items-start w-full">
            <div className="font-semibold text-[#6b7280] text-[12px] tracking-[0.6px] uppercase">
              Limitations
            </div>
            <div className="flex flex-col gap-[3.2px] items-start w-full">
              {[
                "No conversation memory",
                "Single-step retrieval only",
                "No chain-of-thought reasoning",
                "No query rewriting / HyDE",
                "No streaming responses",
              ].map((text) => (
                <div key={text} className="flex gap-2 items-center w-full">
                  <span className="text-[#f87171] text-[10px]">●</span>
                  <span className="text-[#888] text-[11px]">{text}</span>
                </div>
              ))}
            </div>
            <div className="font-semibold text-[#6b7280] text-[12px] tracking-[0.6px] uppercase mt-2">
              Future Improvements
            </div>
            <div className="flex flex-col gap-[3.2px] items-start w-full">
              {[
                "Multi-turn memory (LangGraph)",
                "Self-corrective RAG (CRAG)",
                "HyDE query reformulation",
                "SSE streaming output",
                "Hybrid search (vector + BM25)",
              ].map((text) => (
                <div key={text} className="flex gap-2 items-center w-full">
                  <span className="text-[#34d399] text-[10px]">●</span>
                  <span className="text-[#888] text-[11px]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Architecture Info */}
        <div className="w-full pt-[25px] border-t border-[rgba(255,255,255,0.1)]">
          <div className="flex flex-col gap-3 items-start w-full">
            <div className="font-semibold text-[#6b7280] text-[12px] tracking-[0.6px] uppercase">
              Architecture
            </div>
            <div className="flex flex-col gap-[3.2px] items-start w-full">
              {[
                "LangGraph stateful RAG agent",
                "Multi-provider LLM abstraction",
                "MongoDB Atlas Vector Search (MMR)",
                "Flask clean architecture",
              ].map((text) => (
                <div key={text} className="flex gap-2 items-center w-full">
                  <span className="text-[#888] text-[12px]">&#8226;</span>
                  <span className="text-[#888] text-[12px]">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content Area ───────────────────────────────── */}
      <main className="flex-1 relative flex flex-col h-full z-10 overflow-hidden">
        {/* Header with Status Badge */}
        <div className="absolute top-8 right-8 z-10">
          <div className="flex items-center gap-2 px-[17px] py-[7px] rounded-full bg-[rgba(0,0,0,0.3)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] shadow-lg">
            <div className="w-2 h-2 rounded-full bg-[#0f8] shadow-[0px_0px_5px_0px_#0f8]" />
            <span className="text-[12px] text-white tracking-[0.3px]">
              Connected
            </span>
          </div>
        </div>

        {/* Chat Area */}
        <ChatView provider={provider} />
      </main>
    </div>
  );
}
