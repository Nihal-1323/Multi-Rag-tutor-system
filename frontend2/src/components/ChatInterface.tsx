import React, { useState } from 'react';
import { Send, Terminal, Zap, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ rank: number; filename: string; score: number; relevance: number; type?: string }>;
  thoughtProcess?: string;
  timestamp?: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "⚡ NeuralCore Cognitive System initialized.\n\nType your query to access the knowledge base...",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const userMsg: Message = { role: 'user', content: input, timestamp };
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
        sources: data.sources,
        thoughtProcess: data.explanation,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMsg]);
      setIsTyping(false);
      window.dispatchEvent(new CustomEvent('graphUpdate'));
    })
    .catch(err => {
      console.error('Query error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '⚠️ ERROR: Backend connection failed. Check system status.',
        timestamp: new Date().toLocaleTimeString()
      }]);
      setIsTyping(false);
    });
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg/50">
      {/* Terminal Header */}
      <div className="p-3 bg-cyber-panel/80 backdrop-blur-sm border-b border-cyber-line flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-cyber-accent" />
          <span className="text-xs font-mono text-cyber-accent uppercase tracking-wider">Neural Terminal</span>
          <div className="flex gap-1 ml-4">
            <div className="w-3 h-3 rounded-full bg-cyber-secondary" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-cyber-accent animate-pulse" />
          </div>
        </div>
        <span className="text-[10px] font-mono text-cyber-muted">SESSION: ACTIVE</span>
      </div>

      {/* Messages Area - Terminal Style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scrollbar-visible" style={{ minHeight: 0 }}>
        {messages.map((msg, i) => (
          <div key={i} className="space-y-2">
            {/* Timestamp and Role */}
            <div className="flex items-center gap-3 text-xs">
              <span className="text-cyber-muted">[{msg.timestamp}]</span>
              <span className={cn(
                "font-bold uppercase",
                msg.role === 'user' ? "text-cyber-secondary" : "text-cyber-accent"
              )}>
                {msg.role === 'user' ? '> USER' : '< SYSTEM'}
              </span>
            </div>

            {/* Message Content */}
            <div className={cn(
              "pl-6 border-l-2 py-2",
              msg.role === 'user' 
                ? "border-cyber-secondary text-cyber-text" 
                : "border-cyber-accent text-cyber-text/90"
            )}>
              <div className="prose prose-sm max-w-none prose-invert">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>

            {/* Ranking Explanation and Sources Side by Side */}
            {msg.thoughtProcess && msg.sources && msg.sources.length > 0 && (
              <div className="pl-6 grid grid-cols-2 gap-4 mt-2">
                {/* Left: Ranking Explanation */}
                <div className="border border-cyber-accent/30 bg-cyber-panel/50 rounded p-3">
                  <div className="text-[10px] text-teal-400 uppercase tracking-wider mb-2">
                    └─ RANKING PROCESS:
                  </div>
                  <p className="text-xs text-cyber-text/80 leading-relaxed font-mono">
                    {msg.thoughtProcess}
                  </p>
                </div>
                
                {/* Right: Ranked Sources */}
                <div>
                  <div className="text-[10px] text-teal-400 uppercase tracking-wider mb-2">
                    └─ TOP SOURCES:
                  </div>
                  <div className="space-y-1">
                    {msg.sources.slice(0, 3).map((source, si) => (
                      <div key={si} className="flex items-center gap-2 text-xs border border-teal-500/30 bg-teal-950/30 rounded px-3 py-2">
                        <span className="text-teal-400 font-bold">#{source.rank}</span>
                        <span className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          source.type === 'vector' ? "bg-teal-500" : "bg-cyan-500"
                        )} />
                        <span className="flex-1 truncate text-cyber-text">{source.filename}</span>
                        <span className="text-teal-400 font-medium">{(source.relevance * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Sources - Compact List (when no thoughtProcess) */}
            {msg.sources && msg.sources.length > 0 && !msg.thoughtProcess && (
              <div className="pl-6 space-y-1">
                <div className="text-[10px] text-cyber-muted uppercase tracking-wider mb-2">
                  └─ SOURCES RETRIEVED:
                </div>
                {msg.sources.map((source, si) => (
                  <div key={si} className="flex items-center gap-2 text-xs pl-4">
                    <span className="text-cyber-accent">├─</span>
                    <span className="text-cyber-muted">#{source.rank}</span>
                    <span className="text-cyber-text">{source.filename}</span>
                    <span className="text-cyber-accent ml-auto">
                      {(source.relevance * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-cyber-muted">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-cyber-accent font-bold uppercase">{'< SYSTEM'}</span>
            <Zap className="w-3 h-3 text-cyber-accent animate-pulse" />
            <span className="text-cyber-accent animate-pulse">Processing query...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Command Line Style */}
      <div className="p-4 bg-cyber-panel/80 backdrop-blur-sm border-t border-cyber-accent">
        <div className="flex items-center gap-3">
          <span className="text-cyber-accent font-mono text-sm font-bold">{'>'}</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Enter command..."
            className="flex-1 bg-transparent border-none outline-none text-cyber-text font-mono text-sm placeholder:text-cyber-muted/40"
          />
          <button 
            onClick={handleSend}
            className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg hover:opacity-90 transition-opacity cyber-glow"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
