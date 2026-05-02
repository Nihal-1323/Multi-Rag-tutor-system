import React, { useState } from 'react';
import { 
  Brain, 
  Database, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  TrendingUp,
  Layers
} from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import GraphView from './components/GraphView';
import UploadManager from './components/UploadManager';
import Metrics from './components/Metrics';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');

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

  return (
    <div className="flex flex-col h-screen w-full bg-cyber-bg font-sans overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute inset-0 scanline pointer-events-none" />
      
      {/* Top Navigation Bar */}
      <nav className="relative z-30 h-16 bg-cyber-panel border-b-2 border-cyber-accent flex items-center justify-between px-6 cyber-glow">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-400 rounded-full flex items-center justify-center cyber-glow animate-pulse">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-cyber-accent tracking-tight">NEURALCORE</h1>
              <p className="text-[10px] text-cyber-muted font-mono -mt-1">COGNITIVE SYSTEM</p>
            </div>
          </div>

          {/* Main Tabs */}
          <div className="flex gap-1">
            <TabButton 
              icon={<Sparkles className="w-4 h-4" />} 
              label="Intelligence" 
              active={activeTab === 'chat'}
              onClick={() => setActiveTab('chat')}
            />
            <TabButton 
              icon={<Layers className="w-4 h-4" />} 
              label="Knowledge" 
              active={activeTab === 'knowledge'}
              onClick={() => setActiveTab('knowledge')}
            />
            <TabButton 
              icon={<TrendingUp className="w-4 h-4" />} 
              label="Analytics" 
              active={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-cyber-surface rounded-lg transition-colors">
            <Search className="w-5 h-5 text-cyber-muted hover:text-cyber-accent" />
          </button>
          <button className="p-2 hover:bg-cyber-surface rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-cyber-muted hover:text-cyber-accent" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-cyber-secondary rounded-full animate-pulse" />
          </button>
          <button 
            onClick={handleExportRAG}
            className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-xs font-bold text-white hover:opacity-90 transition-opacity cyber-glow uppercase tracking-wider"
          >
            Export Data
          </button>
          <div className="flex items-center gap-2 pl-4 border-l border-cyber-line">
            <div className="w-8 h-8 bg-gradient-to-br from-cyber-accent to-cyber-secondary rounded-full" />
            <ChevronDown className="w-4 h-4 text-cyber-muted" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 overflow-hidden">
        {activeTab === 'chat' && (
          <div className="h-full grid grid-cols-12 gap-4 p-4">
            {/* Left: Chat - Takes 8 columns */}
            <div className="col-span-8 h-full">
              <div className="h-full neon-border rounded-2xl overflow-hidden bg-cyber-panel/50 backdrop-blur-sm">
                <ChatInterface />
              </div>
            </div>

            {/* Right: Split View - Takes 4 columns */}
            <div className="col-span-4 h-full flex flex-col gap-4">
              {/* Top: Metrics - More prominent */}
              <div className="h-[55%] neon-border rounded-2xl overflow-hidden bg-cyber-panel/50 backdrop-blur-sm">
                <Metrics />
              </div>
              
              {/* Bottom: Graph */}
              <div className="flex-1 neon-border rounded-2xl overflow-hidden bg-cyber-panel/50 backdrop-blur-sm">
                <GraphView />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div className="h-full p-4">
            <div className="h-full neon-border rounded-2xl overflow-hidden bg-cyber-panel/50 backdrop-blur-sm">
              <UploadManager />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="h-full grid grid-cols-2 gap-4 p-4">
            <div className="neon-border rounded-2xl overflow-hidden bg-cyber-panel/50 backdrop-blur-sm">
              <Metrics />
            </div>
            <div className="neon-border rounded-2xl overflow-hidden bg-cyber-panel/50 backdrop-blur-sm">
              <GraphView />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Status Bar */}
      <footer className="relative z-30 h-10 bg-cyber-panel/90 backdrop-blur-sm border-t border-cyber-line px-6 flex items-center justify-between">
        <div className="flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyber-accent animate-pulse cyber-glow" />
            <span className="text-cyber-text">SYSTEM ONLINE</span>
          </div>
          <span className="text-cyber-muted">|</span>
          <span className="text-cyber-muted">LATENCY: 45ms</span>
          <span className="text-cyber-muted">|</span>
          <span className="text-cyber-muted">MEMORY: 2.1GB</span>
          <span className="text-cyber-muted">|</span>
          <span className="text-cyber-muted">QUERIES: 127</span>
        </div>
        <div className="text-xs text-cyber-muted font-mono">
          v2.0.1-ALPHA
        </div>
      </footer>
    </div>
  );
}

function TabButton({ 
  icon, 
  label, 
  active = false,
  onClick
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 relative overflow-hidden",
        active 
          ? "bg-cyber-surface text-cyber-accent border-b-2 border-cyber-accent" 
          : "text-cyber-muted hover:text-cyber-text hover:bg-cyber-surface/50"
      )}
    >
      {active && (
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-cyan-500/10" />
      )}
      <div className="relative z-10">{icon}</div>
      <span className="text-sm font-semibold uppercase tracking-wide relative z-10">{label}</span>
    </button>
  );
}
