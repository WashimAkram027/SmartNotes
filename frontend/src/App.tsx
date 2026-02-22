import { useState } from "react";
import ChatView from "./components/ChatView";
import UploadPanel from "./components/UploadPanel";
import ProviderSelector from "./components/ProviderSelector";
import type { LLMProvider } from "./types";

export default function App() {
  const [provider, setProvider] = useState<LLMProvider>("openai");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col transition-all duration-300 overflow-hidden"
        style={{
          width: sidebarOpen ? "340px" : "0px",
          minWidth: sidebarOpen ? "340px" : "0px",
          background: "var(--bg-secondary)",
          borderRight: sidebarOpen ? "1px solid var(--border)" : "none",
        }}
      >
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl animate-pulse-glow"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
              }}
            >
              📚
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Smart Notes
              </h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                AI-Powered Document Q&A
              </p>
            </div>
          </div>

          {/* Provider Selector */}
          <div>
            <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-muted)" }}>
              LLM Provider
            </label>
            <ProviderSelector provider={provider} onChange={setProvider} />
          </div>

          {/* Upload Panel */}
          <UploadPanel />

          {/* Architecture Badge */}
          <div
            className="rounded-xl p-4 text-xs space-y-2"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            <div className="font-medium" style={{ color: "var(--text-secondary)" }}>
              🏗️ Architecture
            </div>
            <div className="space-y-1">
              <div>• LangGraph stateful RAG agent</div>
              <div>• Multi-provider LLM abstraction</div>
              <div>• MongoDB Atlas Vector Search (MMR)</div>
              <div>• Flask clean architecture</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>

          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--success)" }}
            />
            Connected
          </div>
        </header>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatView provider={provider} />
        </div>
      </main>
    </div>
  );
}
