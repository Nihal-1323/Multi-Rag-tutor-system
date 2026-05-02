import React, { useState } from 'react';
import { Send, Sparkles, User, BrainCircuit, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ rank: number; filename: string; score: number; relevance: number; type?: string }>;
  initialRanking?: Array<{ rank: number; filename: string; score: number; relevance: number }>;
  thoughtProcess?: string;
  searchStats?: {
    documents_searched: number;
    results_found: number;
    top_score: number;
    latency_ms: number;
    ranking_method?: string;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your Multi-Modal Education Tutor. Upload your lecture materials, and I can help you understand complex concepts with hybrid vector and graph-based retrieval.",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedStats, setExpandedStats] = useState<number | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    fetch(`http://localhost:8000/query?query=${encodeURIComponent(input)}&session_id=default`, {
      method: 'POST'
    })
    .then(res => res.json())
    .then(data => {
      const assistantMsg: Message = {
        role: 'assistant',
        content: data.answer,
        thoughtProcess: data.explanation,
        sources: data.sources,
        initialRanking: data.initial_ranking,
        searchStats: data.search_stats
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
      
      // Trigger graph update
      window.dispatchEvent(new CustomEvent('graphUpdate'));
    })
    .catch(err => {
      console.error('Query error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to backend. Please make sure the server is running.' }]);
      setIsTyping(false);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-dash-line flex items-center justify-between">
        <h2 className="text-sm font-semibold text-dash-text flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-dash-accent" />
          AI Assistant
        </h2>
        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">Active</span>
      </div>

      <div className="flex-1 overflow-y-scroll p-6 space-y-4" style={{ minHeight: 0, maxHeight: '100%', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex flex-col gap-2 max-w-[85%]",
            msg.role === 'user' ? "ml-auto" : "mr-auto"
          )}>
            <div className={cn(
              "p-4 rounded-2xl text-sm leading-relaxed relative",
              msg.role === 'user' 
                ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md ml-8" 
                : "bg-dash-surface text-dash-text mr-8 border border-dash-line"
            )}>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
            
            {msg.thoughtProcess && (msg.initialRanking || msg.sources) && (
              <div className="ml-2 grid grid-cols-2 gap-3">
                {/* Left: Ranking Explanation */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-xs text-blue-900 leading-relaxed">
                    <span className="font-semibold mr-1">Ranking:</span>
                    {msg.thoughtProcess}
                  </p>
                </div>
                
                {/* Right: Ranked Sources */}
                <div className="space-y-2">
                  {msg.sources && msg.sources.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 mb-2">Ranked Sources</p>
                      <div className="space-y-1.5">
                        {msg.sources.slice(0, 3).map((source, si) => (
                          <div key={si} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                            <span className="text-emerald-600 font-bold">#{source.rank}</span>
                            <span className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              source.type === 'vector' ? "bg-emerald-500" : "bg-orange-500"
                            )} />
                            <span className="flex-1 truncate text-black">{source.filename}</span>
                            <span className="text-emerald-600 font-medium">{(source.relevance * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {msg.thoughtProcess && !(msg.initialRanking || msg.sources) && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl ml-2">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-semibold mr-1">Ranking:</span>
                  {msg.thoughtProcess}
                </p>
              </div>
            )}

            {(msg.initialRanking || msg.sources) && (
              <div className="ml-2 space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  {/* Initial Ranking Column */}
                  {msg.initialRanking && msg.initialRanking.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-2">Initial Ranking</p>
                      <div className="space-y-1.5">
                        {msg.initialRanking.map((source, si) => (
                          <div key={si} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-xs">
                            <span className="text-blue-600 font-bold">#{source.rank}</span>
                            <span className="w-2 h-2 rounded-full shrink-0 bg-blue-500" />
                            <span className="flex-1 truncate text-black">{source.filename}</span>
                            <span className="text-blue-600 font-medium">{(source.relevance * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reranked Sources Column */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 mb-2">Reranked Sources</p>
                      <div className="space-y-1.5">
                        {msg.sources.map((source, si) => (
                          <div key={si} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                            <span className="text-emerald-600 font-bold">#{source.rank}</span>
                            <span className={cn(
                              "w-2 h-2 rounded-full shrink-0",
                              source.type === 'vector' ? "bg-emerald-500" : "bg-orange-500"
                            )} />
                            <span className="flex-1 truncate text-black">{source.filename}</span>
                            <span className="text-emerald-600 font-medium">{(source.relevance * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {msg.searchStats && (
              <div className="ml-2 mt-2">
                <button
                  onClick={() => setExpandedStats(expandedStats === i ? null : i)}
                  className="text-[9px] font-mono text-dash-accent hover:text-dash-text transition-colors flex items-center gap-1"
                >
                  <span>{expandedStats === i ? '▼' : '▶'}</span>
                  Top-K Ranking & Reranking Stats
                </button>
                {expandedStats === i && (
                  <div className="mt-2 p-2 bg-dash-surface border border-dash-line rounded text-[9px] font-mono space-y-1">
                    <div className="flex justify-between">
                      <span className="text-dash-muted">Documents Searched:</span>
                      <span className="text-dash-text font-bold">{msg.searchStats.documents_searched}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dash-muted">Results Found (K):</span>
                      <span className="text-dash-text font-bold">{msg.searchStats.results_found}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dash-muted">Top Score:</span>
                      <span className="text-emerald-400 font-bold">{msg.searchStats.top_score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dash-muted">Latency:</span>
                      <span className="text-blue-400 font-bold">{msg.searchStats.latency_ms}ms</span>
                    </div>
                    {msg.searchStats.ranking_method && (
                      <div className="mt-2 pt-2 border-t border-dash-line">
                        <p className="text-dash-muted mb-1">Ranking Method:</p>
                        <p className="text-dash-text text-[8px]">{msg.searchStats.ranking_method}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3 p-3 bg-purple-50 border border-purple-200 w-fit rounded-xl animate-pulse ml-2 text-sm text-purple-700">
            <Sparkles className="w-5 h-5" />
            Generating response...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-dash-line bg-dash-surface">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your learning materials..."
            className="w-full bg-white border border-dash-line rounded-xl py-3 pl-4 pr-14 text-sm text-black focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder:text-gray-500"
          />
          <button 
            onClick={handleSend}
            className="absolute right-2 top-2 p-2 gradient-bg rounded-lg hover:opacity-90 transition-opacity shadow-md"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
