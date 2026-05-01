/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  Bell,
  Search,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import GraphView from './components/GraphView';
import UploadManager from './components/UploadManager';
import Metrics from './components/Metrics';
import { cn } from './lib/utils';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCorpus, setShowCorpus] = useState(false);
  const [corpusData, setCorpusData] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showArchitecture, setShowArchitecture] = useState(false);

  const handleViewLogs = () => {
    fetch('http://localhost:8000/logs')
      .then(res => res.json())
      .then(data => {
        console.log('System Logs:', data);
        alert(`System Logs:\n\nTotal Queries: ${data.total_queries}\nDocuments: ${data.documents}\nGraph Nodes: ${data.graph_nodes}\nGraph Links: ${data.graph_links}\n\nCheck console for full logs.`);
      })
      .catch(err => console.error('Failed to fetch logs:', err));
  };

  const handleExportRAG = () => {
    fetch('http://localhost:8000/export')
      .then(res => res.json())
      .then(data => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rag-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Failed to export RAG data:', err));
  };

  const handleShowCorpus = () => {
    fetch('http://localhost:8000/documents')
      .then(res => res.json())
      .then(data => {
        setCorpusData(data);
        setShowCorpus(true);
      })
      .catch(err => console.error('Failed to fetch corpus:', err));
  };

  const handleShowSearch = () => {
    setShowSearch(true);
  };

  const handleShowAlerts = () => {
    setShowAlerts(true);
  };

  const handleShowArchitecture = () => {
    setShowArchitecture(true);
  };

  return (
    <div className="flex h-screen w-full bg-dash-bg font-sans selection:bg-dash-accent/30 selection:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-[#0A0C10] border-r border-dash-line flex flex-col transition-all duration-300 z-20",
        sidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="p-4 border-b border-dash-line bg-dash-panel">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-dash-accent flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-[11px] font-bold tracking-widest text-dash-accent uppercase">Smart Tutor</h1>
                <p className="text-[9px] text-dash-muted mt-0.5">MM Graph-RAG v1.2.4</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-2 space-y-1 mt-4">
          <NavItem icon={<LayoutDashboard />} label="Internal Dashboard" active sidebarOpen={sidebarOpen} />
          <NavItem icon={<GraduationCap />} label="Knowledge Corpus" sidebarOpen={sidebarOpen} onClick={handleShowCorpus} />
          <NavItem icon={<Search />} label="System Search" sidebarOpen={sidebarOpen} onClick={handleShowSearch} />
        </nav>

        <div className="px-2 pb-4 space-y-1">
          <NavItem icon={<Bell />} label="System Alerts" badge="2" sidebarOpen={sidebarOpen} onClick={handleShowAlerts} />
          <NavItem icon={<Settings />} label="Architecture" sidebarOpen={sidebarOpen} onClick={handleShowArchitecture} />
          <div className="h-px bg-dash-line my-3" />
          <NavItem icon={<LogOut />} label="Terminate" sidebarOpen={sidebarOpen} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-12 border-b border-dash-line flex items-center justify-between px-4 bg-dash-panel shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-dash-surface rounded transition-colors text-dash-muted hover:text-dash-text"
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </button>
            <div className="h-4 w-px bg-dash-line mx-1" />
            <div>
               <h1 className="text-xs font-semibold text-dash-text">Active Session: Neural_Architectures_L4</h1>
            </div>
            <span className="text-[10px] text-yellow-500 font-mono hidden md:inline-block">Reranking Active (v2.1)</span>
          </div>
          
          <div className="flex gap-2">
             <button 
               onClick={handleViewLogs}
               className="h-7 px-3 bg-dash-surface rounded flex items-center justify-center text-[10px] border border-dash-line text-dash-muted hover:text-dash-text cursor-pointer transition-colors"
             >
               View Logs
             </button>
             <button 
               onClick={handleExportRAG}
               className="h-7 px-3 bg-dash-accent rounded flex items-center justify-center text-[10px] text-white font-medium hover:opacity-90 transition-opacity cursor-pointer"
             >
               Export RAG
             </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 grid grid-cols-12 gap-px bg-dash-line" style={{ minHeight: 0 }}>
           {/* Left: Chat Control */}
           <div className="col-span-12 lg:col-span-4 bg-dash-bg" style={{ minHeight: 0 }}>
              <ChatInterface />
           </div>

           {/* Right Toolset */}
           <div className="col-span-12 lg:col-span-8 flex flex-col bg-dash-bg" style={{ minHeight: 0 }}>
              <div className="flex-1 grid grid-cols-2 gap-px border-b border-dash-line bg-dash-line" style={{ minHeight: 0 }}>
                 <div className="bg-dash-bg relative" style={{ minHeight: 0 }}>
                    <GraphView />
                 </div>
                 <div className="bg-dash-bg border-l border-dash-line" style={{ minHeight: 0 }}>
                    <Metrics />
                 </div>
              </div>
              
              <div className="h-[40%] bg-dash-bg overflow-auto">
                 <UploadManager />
              </div>
           </div>
        </div>
        
        {/* Footer info Bar */}
        <footer className="h-8 bg-dash-panel border-t border-dash-line px-4 flex items-center justify-between">
           <span className="text-[9px] text-dash-muted uppercase font-bold tracking-tighter">Docker: Running 4/4 containers</span>
           <div className="flex gap-1.5">
              {[0,1,2,3].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]" />
              ))}
           </div>
        </footer>
      </main>

      {/* Knowledge Corpus Modal */}
      {showCorpus && corpusData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowCorpus(false)}>
          <div className="bg-dash-panel border border-dash-line rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-dash-line flex items-center justify-between">
              <h2 className="text-sm font-bold text-dash-text">Knowledge Corpus</h2>
              <button onClick={() => setShowCorpus(false)} className="text-dash-muted hover:text-dash-text">✕</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <p className="text-xs text-dash-muted mb-4">Total Documents: {corpusData.count}</p>
              <div className="space-y-3">
                {corpusData.documents.map((doc: any, i: number) => (
                  <div key={i} className="bg-dash-bg border border-dash-line p-3 rounded">
                    <h3 className="text-xs font-bold text-dash-text mb-2">{doc.filename}</h3>
                    <div className="text-[10px] text-dash-muted space-y-1">
                      <p>Type: {doc.type} | Size: {(doc.size / 1024).toFixed(2)} KB</p>
                      <p>Concepts: {doc.concepts.join(', ')}</p>
                      <p className="mt-2 text-[9px] font-mono bg-dash-surface p-2 rounded">{doc.preview}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Search Modal */}
      {showSearch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowSearch(false)}>
          <div className="bg-dash-panel border border-dash-line rounded-lg max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-dash-line flex items-center justify-between">
              <h2 className="text-sm font-bold text-dash-text">System Search</h2>
              <button onClick={() => setShowSearch(false)} className="text-dash-muted hover:text-dash-text">✕</button>
            </div>
            <div className="p-4">
              <input 
                type="text" 
                placeholder="Search documents, queries, concepts..." 
                className="w-full bg-dash-bg border border-dash-line rounded-md py-2 px-3 text-xs focus:outline-none focus:border-dash-accent"
              />
              <p className="text-[10px] text-dash-muted mt-3">Search across all uploaded documents and query history</p>
            </div>
          </div>
        </div>
      )}

      {/* System Alerts Modal */}
      {showAlerts && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAlerts(false)}>
          <div className="bg-dash-panel border border-dash-line rounded-lg max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-dash-line flex items-center justify-between">
              <h2 className="text-sm font-bold text-dash-text">System Alerts</h2>
              <button onClick={() => setShowAlerts(false)} className="text-dash-muted hover:text-dash-text">✕</button>
            </div>
            <div className="p-4 space-y-2">
              <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded">
                <p className="text-xs text-yellow-400 font-bold">⚠ High Query Latency</p>
                <p className="text-[10px] text-dash-muted mt-1">Average response time increased to 450ms</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded">
                <p className="text-xs text-blue-400 font-bold">ℹ New Document Uploaded</p>
                <p className="text-[10px] text-dash-muted mt-1">UNIT 3.pdf successfully indexed</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Modal */}
      {showArchitecture && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowArchitecture(false)}>
          <div className="bg-dash-panel border border-dash-line rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-dash-line flex items-center justify-between">
              <h2 className="text-sm font-bold text-dash-text">System Architecture</h2>
              <button onClick={() => setShowArchitecture(false)} className="text-dash-muted hover:text-dash-text">✕</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="space-y-4 text-xs text-dash-text">
                <div>
                  <h3 className="font-bold text-dash-accent mb-2">Multi-Modal RAG Pipeline</h3>
                  <p className="text-dash-muted">1. Document Ingestion → 2. Vector Embedding → 3. Graph Construction → 4. Hybrid Retrieval → 5. Reranking → 6. LLM Generation</p>
                </div>
                <div>
                  <h3 className="font-bold text-dash-accent mb-2">Components</h3>
                  <ul className="text-dash-muted space-y-1 list-disc list-inside">
                    <li>Vector Store: In-memory document embeddings</li>
                    <li>Knowledge Graph: Concept relationships and traversal</li>
                    <li>Cross-Encoder: Result reranking for relevance</li>
                    <li>LLM: Ollama integration for answer generation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-dash-accent mb-2">Ranking Algorithm</h3>
                  <ul className="text-dash-muted space-y-1 list-disc list-inside">
                    <li>Exact Match: +100 points</li>
                    <li>Word Frequency: +5 per occurrence</li>
                    <li>Proximity Bonus: +20 for nearby terms</li>
                    <li>Results sorted by score (highest first)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ 
  icon, 
  label, 
  active = false, 
  badge, 
  sidebarOpen,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  badge?: string;
  sidebarOpen: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative",
        active ? "bg-dash-accent text-white" : "hover:bg-dash-surface text-dash-muted hover:text-dash-text"
      )}
    >
      <div className={cn(
        "shrink-0",
        active ? "text-white" : "text-dash-muted group-hover:text-dash-accent"
      )}>
        {React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 16 })}
      </div>
      {sidebarOpen && (
        <>
          <span className="text-[11px] font-medium flex-1 text-left">{label}</span>
          {badge && (
            <span className="px-1 py-0.5 rounded bg-dash-accent/20 text-dash-accent text-[9px] font-bold">
              {badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}


