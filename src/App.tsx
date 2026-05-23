import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ObservabilityTrace } from './components/ObservabilityTrace';
import { Toast } from './components/ui/Toast';
import { Auth } from './components/Auth';
import type { SystemConfig, DocumentItem, ChatMessage, RetrievalChunk } from './types';

export const App: React.FC = () => {
  // Config state
  const [config, setConfig] = useState<SystemConfig | null>(null);
  
  // Storage settings state
  const [accessKey, setAccessKey] = useState<string>(() => {
    return localStorage.getItem('research_assistant_api_key') || 
           (import.meta.env.VITE_ACCESS_KEY as string) || '';
  });
  const [backendUrl, setBackendUrl] = useState<string>(() => {
    return localStorage.getItem('research_assistant_backend_url') || 
           (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000';
  });

  // User authentication JWT token state
  const [jwtToken, setJwtToken] = useState<string>(() => {
    return localStorage.getItem('research_assistant_jwt') || '';
  });

  // Data list states
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false);
  const [isIndexing, setIsIndexing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUnauthorized, setIsUnauthorized] = useState<boolean>(false);

  // Chat/Tracing states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [retrievedChunks, setRetrievedChunks] = useState<RetrievalChunk[]>([]);
  const [highlightedSource, setHighlightedSource] = useState<{ filename: string; page: number } | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  // Toast utility helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
  }, []);

  // Request headers helper
  const getHeaders = useCallback((extra = {}) => {
    const headers: Record<string, string> = { ...extra };
    if (jwtToken.trim()) {
      headers['Authorization'] = `Bearer ${jwtToken.trim()}`;
    } else if (accessKey.trim()) {
      headers['X-API-KEY'] = accessKey.trim();
    }
    return headers;
  }, [jwtToken, accessKey]);

  // Check system config from backend
  const checkSystemConfig = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/api/config`);
      if (!response.ok) throw new Error('API Unreachable');
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error('Error fetching config:', err);
      setConfig(null);
    }
  }, [backendUrl]);

  // Load document list from backend
  const loadDocumentsCatalog = useCallback(async () => {
    setLoadingDocs(true);
    try {
      const response = await fetch(`${backendUrl}/api/documents`, {
        headers: getHeaders()
      });

      if (response.status === 403) {
        setIsUnauthorized(true);
        setDocuments([]);
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch documents');

      const data = await response.json();
      setDocuments(data.documents || []);
      setIsUnauthorized(false);
    } catch (err) {
      console.error('Error loading documents:', err);
      showToast('API error: Failed to connect to documents catalog.');
    } finally {
      setLoadingDocs(false);
    }
  }, [backendUrl, getHeaders, showToast]);

  // Initial load
  useEffect(() => {
    checkSystemConfig();
    if (jwtToken) {
      loadDocumentsCatalog();
    }
  }, [checkSystemConfig, loadDocumentsCatalog, jwtToken]);

  // Save Settings handler
  const handleSaveConfig = () => {
    // Sanitize backend URL (strip trailing slash)
    let sanitizedUrl = backendUrl.trim();
    if (sanitizedUrl.endsWith('/')) {
      sanitizedUrl = sanitizedUrl.slice(0, -1);
    }
    setBackendUrl(sanitizedUrl);

    localStorage.setItem('research_assistant_api_key', accessKey.trim());
    localStorage.setItem('research_assistant_backend_url', sanitizedUrl);
    
    showToast('Connection settings saved successfully!');
    
    // Trigger refresh immediately
    setTimeout(() => {
      checkSystemConfig();
      if (jwtToken) {
        loadDocumentsCatalog();
      }
    }, 100);
  };

  // Document indexing/ingesting trigger
  const handleIngest = async () => {
    setIsIndexing(true);
    showToast('Ingesting documents from data/ ...');
    try {
      const response = await fetch(`${backendUrl}/api/index`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.status === 403) {
        showToast('Access Denied: Invalid or missing App Access Key.');
        return;
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Ingestion failed');
      }

      const result = await response.json();
      if (result.status === 'success') {
        showToast(`Success! Indexed ${result.total_chunks} chunks across ${result.indexed_files.length} PDFs.`);
        loadDocumentsCatalog();
      } else {
        showToast(result.message || 'Indexing completed with warnings.');
      }
    } catch (err: any) {
      console.error('Error indexing:', err);
      showToast(`Indexing failed: ${err.message}`);
    } finally {
      setIsIndexing(false);
    }
  };

  // Upload single PDF handler
  const handleUploadFile = useCallback(async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    showToast(`Uploading '${file.name}' for background processing...`);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        headers: getHeaders(),
        body: formData
      });
      
      if (res.status === 403) {
        setIsUnauthorized(true);
        showToast('Authentication failed. Invalid Access Key.');
        return;
      }
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Upload failed');
      }
      
      const data = await res.json();
      showToast(data.message || 'File uploaded successfully! Processing...');
      
      // Auto-refresh document list after 5 seconds since ingestion runs in background
      setTimeout(() => {
        loadDocumentsCatalog();
      }, 5000);
      
    } catch (err: any) {
      console.error('File upload error:', err);
      showToast(`Upload failed: ${err.message || 'Server error'}`);
    } finally {
      setIsUploading(false);
    }
  }, [backendUrl, getHeaders, showToast, loadDocumentsCatalog]);

  // Chat message submission
  const handleSendMessage = async (content: string) => {
    const userMsg: ChatMessage = { role: 'user', content };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      // Build request body matching FastAPI ChatRequest schema
      const history = chatMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          query: content,
          history: history
        })
      });

      if (response.status === 403) {
        throw new Error('Access Denied: Invalid or missing App Access Key.');
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Failed to fetch RAG response');
      }

      const result = await response.json();
      
      // Append assistant message
      const assistantMsg: ChatMessage = { role: 'model', content: result.answer };
      setChatMessages((prev) => [...prev, assistantMsg]);
      
      // Update trace
      setRetrievedChunks(result.context || []);

    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        role: 'model',
        content: `⚠️ **Error generating answer:** ${err.message}. Please verify your connection configuration and API keys.`
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear chat
  const handleClearChat = () => {
    setChatMessages([]);
    setRetrievedChunks([]);
    setHighlightedSource(null);
    showToast('Chat history and context traces cleared.');
  };

  // Citation Click callback
  const handleCitationClick = (filename: string, page: number) => {
    setHighlightedSource({ filename, page });
    showToast(`Scrolled to chunk source: ${filename} (Page ${page})`);
    
    // Auto-reset highlight after 2.5s for a nice flashing effect
    setTimeout(() => {
      setHighlightedSource(null);
    }, 2500);
  };

  if (!jwtToken) {
    return (
      <>
        <Auth
          backendUrl={backendUrl}
          onLoginSuccess={(token) => {
            setJwtToken(token);
            localStorage.setItem('research_assistant_jwt', token);
          }}
          showToast={showToast}
        />
        <Toast
          message={toastMessage}
          visible={toastVisible}
          onClose={() => setToastVisible(false)}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base text-text-primary">
      {/* Sidebar - System status and inputs */}
      <Sidebar
        config={config}
        documents={documents}
        loadingDocs={loadingDocs}
        isIndexing={isIndexing}
        isUploading={isUploading}
        accessKey={accessKey}
        backendUrl={backendUrl}
        isUnauthorized={isUnauthorized}
        onAccessKeyChange={setAccessKey}
        onBackendUrlChange={setBackendUrl}
        onSaveConfig={handleSaveConfig}
        onIngest={handleIngest}
        onUploadFile={handleUploadFile}
        onRefreshCatalog={loadDocumentsCatalog}
        onLogout={() => {
          setJwtToken('');
          localStorage.removeItem('research_assistant_jwt');
          setDocuments([]);
          setChatMessages([]);
          setRetrievedChunks([]);
        }}
      />

      {/* Main Content Area */}
      <ChatArea
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onClearChat={handleClearChat}
        isGenerating={isGenerating}
        onCitationClick={handleCitationClick}
      />

      {/* Right Sidebar - Retrieval tracing */}
      <ObservabilityTrace
        chunks={retrievedChunks}
        highlightedSource={highlightedSource}
      />

      {/* Global Toast Message Notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
};

export default App;
