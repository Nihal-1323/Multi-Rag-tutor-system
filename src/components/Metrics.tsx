import React, { useEffect, useState } from 'react';
import { AreaChart, Activity, Cpu, Database, Download } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = () => {
    fetch('http://localhost:8000/metrics')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch metrics:', err);
        setIsLoading(false);
      });
  };

  const displayMetrics = [
    { label: "Precision@K", value: metrics.precision.toFixed(2), icon: <Database className="w-3 h-3" /> },
    { label: "Recall@K", value: metrics.recall.toFixed(2), icon: <AreaChart className="w-3 h-3" /> },
    { label: "F1 Score", value: metrics.f1_score.toFixed(2), icon: <Cpu className="w-3 h-3" /> },
    { label: "Latency", value: `${metrics.latency}ms`, icon: <Activity className="w-3 h-3" /> },
  ];

  return (
    <div className="flex flex-col h-full bg-dash-bg overflow-auto">
      <div className="p-3 border-b border-dash-line bg-dash-panel flex items-center justify-between shrink-0">
        <h2 className="mono-label">System Performance</h2>
        <div className="flex gap-2 items-center">
           <span className="text-[9px] text-dash-muted font-mono">{metrics.documents} docs • {metrics.queries} queries</span>
           <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'}`} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 p-3 flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {displayMetrics.map((m, i) => (
          <div key={i} className="bg-dash-panel border border-dash-line p-3 flex flex-col justify-between hover:border-dash-accent/50 transition-colors group">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-dash-muted group-hover:text-dash-accent">
                {m.label}
              </span>
              <div className="p-1 bg-dash-surface rounded text-dash-muted group-hover:text-dash-accent">
                {m.icon}
              </div>
            </div>
            <div className="mt-2">
               <span className="text-xl font-mono font-medium tracking-tight text-dash-text">
                 {m.value}
               </span>
            </div>
          </div>
        ))}
        
        <div className="col-span-2 bg-dash-panel border border-dash-line p-3 mt-1">
           <h3 className="text-[9px] font-bold uppercase tracking-widest text-dash-muted mb-3 opacity-70">Retrieval Performance</h3>
           <div className="space-y-3">
              <div className="space-y-1">
                 <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-dash-muted">VECTOR SEARCH</span>
                    <span className="text-emerald-400">{(metrics.precision * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-1 bg-dash-surface rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/80 transition-all duration-500" style={{ width: `${metrics.precision * 100}%` }} />
                 </div>
              </div>
              <div className="space-y-1">
                 <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-dash-muted">GRAPH GROUNDING</span>
                    <span className="text-blue-400">{(metrics.recall * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-1 bg-dash-surface rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/80 transition-all duration-500" style={{ width: `${metrics.recall * 100}%` }} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
