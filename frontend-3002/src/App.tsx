import React, { useState } from 'react';
import { Brain, Database, Upload, BarChart3, Menu, X } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import GraphView from './components/GraphView';
import Metrics from './components/Metrics';
import UploadManager from './components/UploadManager';

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'graph' | 'metrics' | 'upload'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 shadow-sm z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MultiModal RAG
              </h1>
              <p className="text-xs text-gray-500">Intelligent Knowledge Retrieval</p>
            </div>
          </div>
          
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={`${sidebarOpen ? 'w-20' : 'w-0'} lg:w-20 bg-white/60 backdrop-blur-sm border-r border-blue-100 transition-all duration-300 overflow-hidden`}>
          <nav className="flex flex-col gap-2 p-3 mt-4">
            <button
              onClick={() => setActiveTab('chat')}
              className={`p-4 rounded-2xl transition-all ${
                activeTab === 'chat'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600'
              }`}
              title="Chat"
            >
              <Brain className="w-6 h-6 mx-auto" />
            </button>
            
            <button
              onClick={() => setActiveTab('graph')}
              className={`p-4 rounded-2xl transition-all ${
                activeTab === 'graph'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600'
              }`}
              title="Knowledge Graph"
            >
              <Database className="w-6 h-6 mx-auto" />
            </button>
            
            <button
              onClick={() => setActiveTab('metrics')}
              className={`p-4 rounded-2xl transition-all ${
                activeTab === 'metrics'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600'
              }`}
              title="Metrics"
            >
              <BarChart3 className="w-6 h-6 mx-auto" />
            </button>
            
            <button
              onClick={() => setActiveTab('upload')}
              className={`p-4 rounded-2xl transition-all ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600'
              }`}
              title="Upload"
            >
              <Upload className="w-6 h-6 mx-auto" />
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden p-6">
          <div className="h-full bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
            {activeTab === 'chat' && <ChatInterface />}
            {activeTab === 'graph' && <GraphView />}
            {activeTab === 'metrics' && <Metrics />}
            {activeTab === 'upload' && <UploadManager />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
