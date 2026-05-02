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
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-4 border-b border-dash-line flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-dash-text">Performance</h2>
        <div className="flex gap-2 items-center">
           <span className="text-xs text-dash-muted">{metrics.documents} docs</span>
           <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 p-4 flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {displayMetrics.map((m, i) => (
          <div key={i} className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-dash-line p-4 rounded-xl flex flex-col justify-between hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600 group-hover:text-purple-600">
                {m.label}
              </span>
              <div className="p-1.5 bg-white rounded-lg text-gray-500 group-hover:text-purple-600 shadow-sm">
                {m.icon}
              </div>
            </div>
            <div className="mt-3">
               <span className="text-2xl font-bold text-black">
                 {m.value}
               </span>
            </div>
          </div>
        ))}
        
        <div className="col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 border border-dash-line p-4 rounded-xl mt-1">
           <h3 className="text-xs font-semibold text-black mb-3">Retrieval Performance</h3>
           <div className="space-y-3">
              <div className="space-y-1.5">
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-700 font-medium">Vector Search</span>
                    <span className="text-emerald-600 font-semibold">{(metrics.precision * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 rounded-full" style={{ width: `${metrics.precision * 100}%` }} />
                 </div>
              </div>
              <div className="space-y-1.5">
                 <div className="flex justify-between text-xs">
                    <span className="text-gray-700 font-medium">Graph Grounding</span>
                    <span className="text-blue-600 font-semibold">{(metrics.recall * 100).toFixed(1)}%</span>
                 </div>
                 <div className="h-2 bg-white rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 rounded-full" style={{ width: `${metrics.recall * 100}%` }} />
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
