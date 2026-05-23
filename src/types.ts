export interface SystemConfig {
  gemini_api_key_configured: boolean;
  qdrant_url_configured: boolean;
  app_api_key_configured: boolean;
  mode: string;
}

export interface DocumentItem {
  filename: string;
  pages_count: number;
  chunks_count: number;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'system';
  content: string;
}

export interface RetrievalChunk {
  filename: string;
  page_number: number;
  score: number;
  text: string;
}
