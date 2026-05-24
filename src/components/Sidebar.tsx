import React from 'react';
import { 
  Cpu, 
  Cloud, 
  Database, 
  AlertTriangle, 
  CircleCheck, 
  Key, 
  Globe, 
  Lock, 
  RefreshCw, 
  FolderOpen, 
  FileText, 
  BookOpen, 
  Save,
  Loader2,
  Upload,
  LogOut,
  Trash2
} from 'lucide-react';
import type { SystemConfig, DocumentItem } from '../types';
 
interface SidebarProps {
  config: SystemConfig | null;
  documents: DocumentItem[];
  loadingDocs: boolean;
  isIndexing: boolean;
  isUploading: boolean;
  accessKey: string;
  backendUrl: string;
  isUnauthorized: boolean;
  onAccessKeyChange: (val: string) => void;
  onBackendUrlChange: (val: string) => void;
  onSaveConfig: () => void;
  onIngest: (force: boolean) => void;
  onUploadFile: (file: File, force: boolean) => void;
  onRefreshCatalog: () => void;
  onLogout?: () => void;
  onDeleteDocument?: (filename: string) => void;
}
 
export const Sidebar: React.FC<SidebarProps> = ({
  config,
  documents,
  loadingDocs,
  isIndexing,
  isUploading,
  accessKey,
  backendUrl,
  isUnauthorized,
  onAccessKeyChange,
  onBackendUrlChange,
  onSaveConfig,
  onIngest,
  onUploadFile,
  onRefreshCatalog,
  onLogout,
  onDeleteDocument
}) => {
  const [forceReindex, setForceReindex] = React.useState(false);
  return (
    <aside className="glass-panel w-[320px] flex flex-col h-full shrink-0 border-r border-border-color bg-bg-glass backdrop-blur-md">
      {/* Brand */}
      <div className="p-6 flex items-center justify-between border-b border-border-color">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-secondary to-accent-primary flex items-center justify-center shadow-lg shadow-accent-glow">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Researches<span className="bg-gradient-to-r from-accent-secondary to-accent-primary bg-clip-text text-transparent">AI</span>
          </h1>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 hover:bg-border-color/40 border border-transparent hover:border-border-color rounded-xl text-text-secondary hover:text-red-400 active:scale-95 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sidebar sections container */}
      <div className="flex-1 overflow-y-auto flex flex-col divide-y divide-border-color">
        {/* System Status Section */}
        <div className="p-5 flex flex-col gap-3">
          <h3 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">System Status</h3>
          <div className="bg-bg-surface border border-border-color rounded-xl p-3.5 flex flex-col gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">API Key (Gemini):</span>
              {config?.gemini_api_key_configured ? (
                <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] flex items-center gap-1.5 bg-success-bg text-success border border-success/20">
                  <CircleCheck className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] flex items-center gap-1.5 bg-danger-bg text-danger border border-danger/20 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" /> Missing Key
                </span>
              )}
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Database Mode:</span>
              {config?.mode === 'production-cloud' ? (
                <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] flex items-center gap-1.5 bg-success-bg text-success border border-success/20">
                  <Cloud className="w-3.5 h-3.5" /> Qdrant Cloud
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full font-semibold text-[11px] flex items-center gap-1.5 bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20">
                  <Database className="w-3.5 h-3.5" /> Local Disk
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Security Credentials Section */}
        {!import.meta.env.VITE_API_URL && (!config || config.app_api_key_configured) && (
          <div className="p-5 flex flex-col gap-3">
            <h3 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Security Settings</h3>
            <div className="bg-bg-surface border border-border-color rounded-xl p-3.5 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-text-secondary flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-accent-secondary" /> Backend API URL:
                </label>
                <input
                  type="text"
                  value={backendUrl}
                  onChange={(e) => onBackendUrlChange(e.target.value)}
                  placeholder="e.g. http://localhost:8000"
                  className="bg-bg-base border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-text-secondary flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-accent-secondary" /> Access Key (X-API-KEY):
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={accessKey}
                    onChange={(e) => onAccessKeyChange(e.target.value)}
                    placeholder="Enter Access Key"
                    className="flex-1 bg-bg-base border border-border-color rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-primary"
                  />
                  <button
                    onClick={onSaveConfig}
                    className="p-1.5 rounded-lg bg-bg-surface-elevated hover:bg-border-color border border-border-color text-text-primary hover:text-accent-primary transition-all duration-200"
                    title="Save Settings"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Document Catalog Section */}
        <div className="p-5 flex-1 flex flex-col gap-3 min-h-0">
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest text-text-secondary font-semibold">Document Catalog</h3>
            <button
              onClick={onRefreshCatalog}
              disabled={loadingDocs}
              className="p-1 rounded-md text-text-secondary hover:text-accent-primary hover:bg-bg-surface-elevated disabled:text-text-muted transition-all duration-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDocs ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isUnauthorized ? (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center text-danger">
                <Lock className="w-9 h-9 opacity-80" />
                <p className="text-xs font-semibold mt-2">Invalid or missing Access Key</p>
                <p className="text-[10px] text-text-muted mt-1">Configure credentials above to fetch catalog</p>
              </div>
            ) : loadingDocs && documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-text-muted">
                <Loader2 className="w-8 h-8 animate-spin text-accent-secondary" />
                <p className="text-xs mt-2">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-text-muted gap-2">
                <FolderOpen className="w-8 h-8 opacity-40" />
                <p className="text-xs">No documents indexed yet. Make sure PDFs are in the data/ folder and click Index below.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pr-1">
                {documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="group bg-bg-surface border border-border-color hover:border-border-highlight rounded-xl p-3 flex items-start justify-between gap-3 transition-all duration-300 transform hover:-translate-y-[1px]"
                  >
                    <div className="flex gap-3 min-w-0 flex-1">
                      <FileText className="w-5 h-5 text-accent-secondary shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-white truncate" title={doc.filename}>
                          {doc.filename}
                        </div>
                        <div className="flex gap-3 text-[10px] text-text-secondary mt-1">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-text-muted" /> {doc.pages_count} pages
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3 text-text-muted" /> {doc.chunks_count} chunks
                          </span>
                        </div>
                      </div>
                    </div>
                    {onDeleteDocument && (
                      <button
                        onClick={() => onDeleteDocument(doc.filename)}
                        title="Delete Document"
                        className="p-1.5 text-text-secondary hover:text-red-400 hover:bg-border-color/30 border border-transparent hover:border-border-color rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 self-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer (Ingestion Trigger) */}
      <div className="p-5 border-t border-border-color bg-bg-surface/50">
        <div className="flex flex-col gap-3">
          {/* Overwrite checkbox */}
          <div className="flex items-center gap-2.5 pb-1 text-[11px] text-text-secondary select-none">
            <input
              type="checkbox"
              id="force-reindex-checkbox"
              checked={forceReindex}
              onChange={(e) => setForceReindex(e.target.checked)}
              className="accent-accent-primary w-3.5 h-3.5 rounded border-border-color cursor-pointer bg-bg-surface bg-no-repeat bg-center bg-contain border border-border-color checked:bg-accent-primary checked:border-transparent focus:outline-none"
            />
            <label htmlFor="force-reindex-checkbox" className="cursor-pointer hover:text-white transition-colors duration-150">
              Overwrite existing vectors (Re-vectorize)
            </label>
          </div>

          {/* PDF file upload label */}
          <div>
            <input
              type="file"
              id="pdf-upload-input"
              accept=".pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onUploadFile(e.target.files[0], forceReindex);
                }
              }}
              disabled={isUploading || isUnauthorized}
            />
            <label
              htmlFor="pdf-upload-input"
              className={`w-full bg-gradient-to-r from-accent-secondary to-accent-primary text-bg-base hover:scale-[1.02] active:scale-[0.98] font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-glow cursor-pointer transition-all duration-300 text-center ${
                (isUploading || isUnauthorized) ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading PDF...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload & Index PDF
                </>
              )}
            </label>
          </div>

          {/* Legacy Bulk scan trigger */}
          <button
            onClick={() => onIngest(forceReindex)}
            disabled={isIndexing || isUploading || isUnauthorized}
            className="w-full bg-bg-surface-elevated hover:bg-border-color border border-border-color text-text-secondary hover:text-white font-semibold text-[11px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200"
          >
            {isIndexing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning local folder...
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" /> Scan backend data/ folder
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
