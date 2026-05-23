import React, { useRef, useEffect } from 'react';
import { 
  User, 
  BrainCircuit, 
  Trash2, 
  Send, 
  Loader2, 
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import type { ChatMessage } from '../types';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
  isGenerating: boolean;
  onCitationClick: (filename: string, page: number) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  onClearChat,
  isGenerating,
  onCitationClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textareaRef.current) return;
    
    const query = textareaRef.current.value.trim();
    if (!query) return;

    onSendMessage(query);
    textareaRef.current.value = '';
    textareaRef.current.style.height = 'auto';
  };

  // Submit on enter (no shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Safe parsing helper that builds React nodes rather than using dangerouslySetInnerHTML
  const parseMessageContent = (text: string) => {
    // 1. Split by citation tags like [filename.pdf, Page X]
    const citationRegex = /(\[[^\]]+?\.pdf,\s*Page\s*\d+\])/gi;
    const parts = text.split(citationRegex);

    return parts.map((part, index) => {
      // Check if this part is a citation tag
      if (part.match(citationRegex)) {
        // Extract filename and page number
        const match = part.match(/\[([^\]]+?\.pdf),\s*Page\s*(\d+)\]/i);
        if (match) {
          const filename = match[1];
          const page = parseInt(match[2], 10);
          return (
            <button
              key={index}
              onClick={() => onCitationClick(filename, page)}
              className="inline-flex items-center gap-1 px-2 py-0.5 mx-0.5 rounded bg-accent-glow hover:bg-accent-primary/25 border border-accent-primary/20 text-accent-primary text-[11px] font-medium cursor-pointer transition-all duration-200"
            >
              <FileSpreadsheet className="w-3 h-3" />
              {page}
            </button>
          );
        }
      }

      // 2. Parse bold text **text** in non-citation parts
      const boldParts = part.split(/\*\*([^*]+)\*\*/g);
      const boldParsed = boldParts.map((subPart, subIdx) => {
        if (subIdx % 2 === 1) {
          return <strong key={subIdx} className="font-bold text-white">{subPart}</strong>;
        }
        
        // 3. Simple line breaks
        const lines = subPart.split('\n');
        return lines.map((line, lineIdx) => (
          <React.Fragment key={lineIdx}>
            {line}
            {lineIdx < lines.length - 1 && <br />}
          </React.Fragment>
        ));
      });

      return <React.Fragment key={index}>{boldParsed}</React.Fragment>;
    });
  };

  return (
    <section className="flex-1 flex flex-col h-full bg-bg-base relative min-w-0">
      {/* Chat Header */}
      <div className="p-4 border-b border-border-color flex justify-between items-center bg-bg-surface/30 backdrop-blur-sm z-10 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-white">RAG Research Session</h2>
          <p className="text-[11px] text-text-secondary mt-0.5">Contextualized generation backed by your PDF library</p>
        </div>
        <button
          onClick={onClearChat}
          disabled={messages.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-color hover:border-danger/30 hover:bg-danger-bg text-text-secondary hover:text-danger disabled:opacity-50 disabled:pointer-events-none text-xs font-semibold transition-all duration-300"
        >
          <Trash2 className="w-4 h-4" /> Clear Chat
        </button>
      </div>

      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto text-center gap-4 py-8">
            <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-color flex items-center justify-center text-accent-secondary">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Welcome to ResearchesAI!</h3>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                This is a production-level RAG research pipeline. Once you ingest the PDFs in your local <code className="bg-bg-surface border border-border-color px-1.5 py-0.5 rounded text-white text-[11px]">data/</code> folder, you can ask questions, and the assistant will query the vector database and generate answers backed by precise citations.
              </p>
            </div>
            <div className="bg-accent-glow/5 border border-accent-primary/10 rounded-2xl p-4 text-xs text-left flex gap-3 text-text-secondary max-w-lg mt-2">
              <span className="text-base">💡</span>
              <p>
                <strong>Getting Started:</strong> Click <strong>"Ingest & Index PDFs"</strong> in the bottom-left corner to process your PDFs and populate the Qdrant database!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-4 p-4 rounded-2xl max-w-3xl border ${
                msg.role === 'user'
                  ? 'bg-bg-surface border-border-color self-end flex-row-reverse'
                  : 'bg-bg-surface-elevated/40 border-border-color/60 self-start'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center shadow-md ${
                  msg.role === 'user'
                    ? 'bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/20'
                    : 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0 text-sm leading-relaxed text-text-primary">
                {parseMessageContent(msg.content)}
              </div>
            </div>
          ))
        )}

        {isGenerating && (
          <div className="flex gap-4 p-4 rounded-2xl max-w-3xl bg-bg-surface-elevated/40 border border-border-color/60 self-start">
            <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-accent-primary/15 text-accent-primary border border-accent-primary/20 shadow-md">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-accent-primary" />
              <span>Generating response...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Bar */}
      <div className="p-6 border-t border-border-color bg-bg-base shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-3 bg-bg-surface border border-border-color rounded-2xl p-2 focus-within:border-accent-primary transition-all duration-300">
          <textarea
            ref={textareaRef}
            rows={1}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the indexed papers (e.g. 'What are the main results in the transportation study?')"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none border-none py-2 px-3 resize-none max-h-32 min-h-[36px]"
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="p-2.5 rounded-xl bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-bg-base disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 self-end shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-text-muted text-center mt-2.5">
          Answers are strictly generated using retrieved source chunks. All statements carry file and page citations.
        </p>
      </div>
    </section>
  );
};
export default ChatArea;
