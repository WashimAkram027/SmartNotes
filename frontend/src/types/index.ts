/** LLM provider options */
export type LLMProvider = "openai" | "anthropic";

/** A single source document cited in a response */
export interface SourceDocument {
    content: string;
    source: string;
    page: number | null;
}

/** Response from POST /api/query */
export interface QueryResponse {
    answer: string;
    provider: string;
    model: string;
    sources: SourceDocument[];
}

/** Response from POST /api/documents/upload or /text */
export interface DocumentUploadResponse {
    filename: string;
    chunks_stored: number;
    already_existed: boolean;
    message: string;
}

/** A single chat message in the conversation */
export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    provider?: string;
    model?: string;
    sources?: SourceDocument[];
    timestamp: Date;
}
