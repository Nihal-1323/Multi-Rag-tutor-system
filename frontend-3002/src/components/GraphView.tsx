import React, { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Maximize2, RefreshCw, Zap } from 'lucide-react';

interface Node {
  id: string;
  group?: number;
  val?: number;
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

export default function GraphView() {
  const [data, setData] = useState<GraphData>({ nodes: [], links: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchGraph = useCallback(() => {
    setIsRefreshing(true);
    fetch('http://localhost:8000/graph')
      .then(res => res.json())
      .then(graphData => {
        setData({
          nodes: graphData.nodes.map((n: Node) => ({ ...n })),
          links: graphData.links.map((l: Link) => ({ ...l }))
        });
      })
      .catch(err => console.error("Failed to load graph:", err))
      .finally(() => setIsRefreshing(false));
  }, []);

  useEffect(() => {
    fetchGraph();

    const handleGraphUpdate = () => {
      fetchGraph();
    };
    window.addEventListener('graphUpdate', handleGraphUpdate);

    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', updateSize);
    updateSize();
    
    return () => {
      window.removeEventListener('graphUpdate', handleGraphUpdate);
      window.removeEventListener('resize', updateSize);
    };
  }, [fetchGraph]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Header */}
      <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between">
        <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg border border-blue-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Knowledge Graph</h3>
              <p className="text-xs text-gray-500">{data.nodes.length} concepts • {data.links.length} connections</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchGraph}
            disabled={isRefreshing}
            className="p-3 bg-white/90 backdrop-blur-md hover:bg-white rounded-xl shadow-lg border border-blue-100 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-3 bg-white/90 backdrop-blur-md hover:bg-white rounded-xl shadow-lg border border-blue-100 transition-all">
            <Maximize2 className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Graph Canvas */}
      {dimensions.width > 0 && data.nodes.length > 0 && (
        <ForceGraph2D
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(248, 250, 252, 0)"
          nodeAutoColorBy="group"
          nodeLabel="id"
          nodeVal={3}
          linkColor={() => "#93C5FD"}
          linkWidth={1.5}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={2}
          nodeRelSize={4}
          linkDistance={350}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.08}
          d3Force="charge"
          d3ForceStrength={-1500}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            // Validate node coordinates
            if (!node.x || !node.y || !isFinite(node.x) || !isFinite(node.y)) {
              return;
            }

            const label = node.id;
            const fontSize = 10/globalScale;
            const nodeSize = 6;
            
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth + fontSize * 0.6, fontSize * 1.4];

            // Draw node with gradient effect
            try {
              const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, nodeSize);
              gradient.addColorStop(0, node.color || '#3B82F6');
              gradient.addColorStop(1, node.color || '#1E40AF');
              ctx.fillStyle = gradient;
            } catch (e) {
              // Fallback to solid color if gradient fails
              ctx.fillStyle = node.color || '#3B82F6';
            }
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
            ctx.fill();

            // Draw node border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label background
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
            ctx.shadowBlur = 4;
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y + nodeSize + 6,
              bckgDimensions[0],
              bckgDimensions[1]
            );
            ctx.shadowBlur = 0;

            // Draw label text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#1F2937';
            ctx.fillText(label, node.x, node.y + nodeSize + 6 + bckgDimensions[1] / 2);
          }}
          onNodeClick={(node: any) => {
            console.log("Clicked concept:", node.id);
          }}
          cooldownTicks={300}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.3}
          maxZoom={6}
        />
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-blue-100">
        <p className="text-xs font-bold text-gray-700 mb-3">Node Types</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-sm" />
            <span className="text-xs text-gray-600">Core Concept</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-sm" />
            <span className="text-xs text-gray-600">Related Topic</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {data.nodes.length === 0 && !isRefreshing && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-blue-500" />
            </div>
            <p className="text-lg font-semibold text-gray-700">No Knowledge Graph Yet</p>
            <p className="text-sm text-gray-500 mt-1">Upload documents to build your knowledge network</p>
          </div>
        </div>
      )}
    </div>
  );
}
