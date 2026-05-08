import React, { useEffect, useState } from 'react';
import { TrendingUp, Zap, Target, Clock, Database, Activity } from 'lucide-react';

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
    const interval = setInterval(fetchMetrics, 5000);
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

  const statCards = [
    {
      label: "Precision",
      value: (metrics.precision * 100).toFixed(1) + '%',
      icon: Target,
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-50",
      description: "Accuracy of results"
    },
    {
      label: "Recall",
      value: (metrics.recall * 100).toFixed(1) + '%',
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-600",
      bgColor: "from-blue-50 to-cyan-50",
      description: "Coverage of relevant docs"
    },
    {
      label: "F1 Score",
      value: metrics.f1_score.toFixed(3),
      icon: Zap,
      color: "from-purple-500 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
      description: "Harmonic mean"
    },
    {
      label: "Latency",
      value: metrics.latency + 'ms',
      icon: Clock,
      color: "from-orange-500 to-red-600",
      bgColor: "from-orange-50 to-red-50",
      description: "Response time"
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Performance Metrics</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time system analytics</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-sm font-medium text-gray-700">
              {isLoading ? 'Loading...' : 'Live'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-gradient-to-br ${stat.bgColor} p-6 rounded-3xl border border-blue-100 shadow-md hover:shadow-xl transition-all`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000`}
                  style={{ width: stat.label === 'Latency' ? '100%' : stat.value }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Documents Indexed</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.documents}</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-full" />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Queries</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.queries}</p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full" />
        </div>
      </div>

      {/* Performance Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Retrieval Performance</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Vector Search</span>
              <span className="text-sm font-bold text-emerald-600">{(metrics.precision * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.precision * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Graph Retrieval</span>
              <span className="text-sm font-bold text-blue-600">{(metrics.recall * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.recall * 100}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Quality</span>
              <span className="text-sm font-bold text-purple-600">{(metrics.f1_score * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-1000"
                style={{ width: `${metrics.f1_score * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
