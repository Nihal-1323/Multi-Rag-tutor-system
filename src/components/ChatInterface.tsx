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
    <div className="flex flex-col h-full bg-dash-bg">
      <div className="p-3 border-b border-dash-line bg-dash-panel flex items-center justify-between">
        <h2 className="mono-label flex items-center gap-2">
          <BrainCircuit className="w-3.5 h-3.5 text-dash-accent" />
          Multi-Modal Context
        </h2>
        <span className="text-[9px] bg-dash-surface px-1.5 py-0.5 rounded border border-dash-line text-dash-muted">RAG PIPELINE</span>
      </div>

      <div className="flex-1 overflow-y-scroll p-4 space-y-4 scrollbar-visible" style={{ minHeight: 0, maxHeight: '100%', overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex flex-col gap-1.5 max-w-[95%]",
            msg.role === 'user' ? "ml-auto" : "mr-auto"
          )}>
            <div className={cn(
              "p-3 rounded-lg text-xs leading-relaxed border relative",
              msg.role === 'user' 
                ? "bg-dash-surface border-dash-accent/30 text-dash-text ml-8" 
                : "bg-dash-panel border-dash-line text-dash-text mr-8"
            )}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
            
            {msg.thoughtProcess && (
              <div className="p-2 bg-[#0A0C10] border border-dash-line rounded ml-2">
                <p className="text-[9px] font-mono text-dash-muted leading-tight">
                  <span className="text-dash-accent font-bold mr-1">RANKING:</span>
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
                      <p className="text-[9px] font-mono text-blue-400 font-bold mb-1.5">INITIAL RANKED:</p>
                      <div className="space-y-1">
                        {msg.initialRanking.map((source, si) => (
                          <div key={si} className="flex items-center gap-1.5 px-2 py-1 rounded bg-dash-surface border border-dash-line text-[9px] text-dash-muted">
                            <span className="text-blue-400 font-bold">#{source.rank}</span>
                            <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-blue-500" />
                            <span className="flex-1 truncate">{source.filename}</span>
                            <span className="text-blue-400 ml-1">{(source.relevance * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reranked Sources Column */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div>
                      <p className="text-[9px] font-mono text-emerald-400 font-bold mb-1.5">RERANKED SOURCES:</p>
                      <div className="space-y-1">
                        {msg.sources.map((source, si) => (
                          <div key={si} className="flex items-center gap-1.5 px-2 py-1 rounded bg-dash-surface border border-emerald-500/30 text-[9px] text-dash-muted">
                            <span className="text-emerald-400 font-bold">#{source.rank}</span>
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              source.type === 'vector' ? "bg-emerald-500" : "bg-orange-500"
                            )} />
                            <span className="flex-1 truncate">{source.filename}</span>
                            <span className="text-emerald-400 ml-1">{(source.relevance * 100).toFixed(0)}%</span>
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
          <div className="flex gap-2 p-2 border border-dash-line bg-dash-panel w-fit rounded-lg animate-pulse ml-2 text-[10px] text-dash-muted">
            <Sparkles className="w-3.5 h-3.5 text-dash-accent" />
            Generating grounded response...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-dash-panel border-t border-dash-line">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query multi-modal knowledge..."
            className="w-full bg-dash-bg border border-dash-line rounded-md py-2.5 pl-4 pr-12 text-[11px] focus:outline-none focus:border-dash-accent transition-colors placeholder:text-dash-muted/40"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-2">
             <span className="text-[8px] text-dash-muted font-mono bg-dash-surface p-0.5 rounded border border-dash-line">ALT + K</span>
             <button 
               onClick={handleSend}
               className="p-1 bg-dash-accent rounded hover:opacity-90 transition-opacity"
             >
               <Send className="w-3 h-3 text-white" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
