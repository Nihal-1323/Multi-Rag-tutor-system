import React, { useEffect, useState } from 'react';
import { Activity, Zap, Database, Cpu } from 'lucide-react';

interface MetricsData {
  precision: number;
  recall: number;
  f1_score: number;
  latency: number;
  documents: number;
  queries: number;
}

export default function Metrics() {
  const [metrics, setMetrics] = useState<MetricsData>({
    precision: 0,
    recall: 0,
    f1_score: 0,
    latency: 0,
    documents: 0,
    queries: 0
  });

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = () => {
    fetch('http://localhost:8000/metrics')
      .then(res => res.json())
      .then(data => setMetrics(data))
      .catch(err => console.error('Failed to fetch metrics:', err));
  };

  return (
    <div className="flex flex-col h-full bg-cyber-bg/50">
      {/* Header */}
      <div className="p-3 bg-cyber-panel/80 backdrop-blur-sm border-b border-cyber-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyber-accent" />
          <span className="text-xs font-mono text-cyber-accent uppercase tracking-wider">Performance Monitor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyber-accent animate-pulse cyber-glow" />
          <span className="text-[10px] font-mono text-cyber-muted">LIVE</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-2 gap-6">
          {/* Circular Progress Indicators - Larger */}
          <CircularMetric 
            label="PRECISION" 
            value={metrics.precision} 
            color="teal-500"
            icon={<Database className="w-8 h-8" />}
          />
          <CircularMetric 
            label="RECALL" 
            value={metrics.recall} 
            color="cyan-500"
            icon={<Cpu className="w-8 h-8" />}
          />
          <CircularMetric 
            label="F1 SCORE" 
            value={metrics.f1_score} 
            color="teal-400"
            icon={<Zap className="w-8 h-8" />}
          />
          
          {/* Latency Box - Larger */}
          <div className="bg-cyber-surface/50 border-2 border-cyber-line rounded-xl p-6 flex flex-col justify-center items-center cyber-glow backdrop-blur-sm">
            <Activity className="w-8 h-8 text-cyber-accent mb-3" />
            <div className="text-4xl font-bold text-cyber-accent font-mono">{metrics.latency}ms</div>
            <div className="text-xs text-cyber-muted uppercase tracking-wider mt-2">LATENCY</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CircularMetric({ 
  label, 
  value, 
  color,
  icon 
}: { 
  label: string; 
  value: number; 
  color: string;
  icon: React.ReactNode;
}) {
  const percentage = value * 100;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-cyber-surface/50 to-cyber-panel/50 border-2 border-cyber-line rounded-xl p-6 flex flex-col items-center justify-center relative overflow-hidden cyber-glow backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5" />
      
      {/* SVG Circle - Larger */}
      <div className="relative">
        <svg className="w-32 h-32 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-cyber-line/20"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`text-${color} transition-all duration-1000`}
            strokeLinecap="round"
            style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
          />
        </svg>
        
        {/* Center Icon */}
        <div className={`absolute inset-0 flex items-center justify-center text-${color}`}>
          {icon}
        </div>
      </div>

      {/* Value - Larger */}
      <div className="text-3xl font-bold text-cyber-text font-mono mt-4 relative z-10">
        {(percentage).toFixed(1)}%
      </div>
      
      {/* Label */}
      <div className="text-xs text-cyber-muted uppercase tracking-wider mt-2 font-mono relative z-10">
        {label}
      </div>
    </div>
  );
}
