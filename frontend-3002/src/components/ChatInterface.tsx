import React, { useState } from 'react';
import { Send, Sparkles, Bot, User, TrendingUp, Clock } from 'lucide-react';
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
      content: "👋 Welcome! I'm your AI assistant powered by multimodal RAG. Upload documents and ask me anything!",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showStats, setShowStats] = useState<number | null>(null);
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
      window.dispatchEvent(new CustomEvent('graphUpdate'));
    })
    .catch(err => {
      console.error('Query error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Connection error. Please check if the backend is running.' }]);
      setIsTyping(false);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={cn(
            "flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
            msg.role === 'user' ? "flex-row-reverse" : "flex-row"
          )}>
            {/* Avatar */}
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-md",
              msg.role === 'user' 
                ? "bg-gradient-to-br from-indigo-500 to-purple-600" 
                : "bg-gradient-to-br from-blue-500 to-cyan-600"
            )}>
              {msg.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            {/* Message Content */}
            <div className="flex-1 max-w-3xl">
              <div className={cn(
                "p-5 rounded-3xl shadow-md",
                msg.role === 'user'
                  ? "bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100"
                  : "bg-white border border-blue-100"
              )}>
                <div className="prose prose-sm max-w-none text-gray-800">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>

              {/* Thought Process */}
              {msg.thoughtProcess && (
                <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900 mb-1">Reasoning Process</p>
                      <p className="text-xs text-amber-800">{msg.thoughtProcess}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources Display */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>Top Sources ({msg.sources.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {msg.sources.slice(0, 3).map((source, si) => (
                      <div key={si} className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {source.rank}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{source.filename}</p>
                          <p className="text-xs text-gray-500">Relevance: {(source.relevance * 100).toFixed(0)}%</p>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-lg text-xs font-medium",
                          source.type === 'vector' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                        )}>
                          {source.type || 'vector'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Toggle */}
              {msg.searchStats && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowStats(showStats === i ? null : i)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" />
                    {showStats === i ? 'Hide' : 'Show'} Performance Stats
                  </button>
                  {showStats === i && (
                    <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-2xl grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Documents</p>
                        <p className="text-lg font-bold text-gray-900">{msg.searchStats.documents_searched}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Results</p>
                        <p className="text-lg font-bold text-gray-900">{msg.searchStats.results_found}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Top Score</p>
                        <p className="text-lg font-bold text-emerald-600">{msg.searchStats.top_score}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Latency</p>
                        <p className="text-lg font-bold text-blue-600">{msg.searchStats.latency_ms}ms</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="p-5 bg-white border border-blue-100 rounded-3xl shadow-md">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-blue-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your documents..."
            className="w-full bg-white border-2 border-blue-200 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-gray-400 shadow-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-2 p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
