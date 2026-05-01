import React, { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Maximize2, RefreshCw } from 'lucide-react';

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
        // Create a deep copy to avoid mutation issues in React Strict Mode
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

    // Listen for graph update events
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
    <div ref={containerRef} className="relative w-full h-full bg-[#0A0C10] overflow-hidden dot-grid">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-3">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-dash-muted bg-dash-panel/80 px-2 py-1 rounded border border-dash-line">
          Knowledge Graph Visualizer
        </h2>
        <div className="flex gap-1">
          <button 
            onClick={fetchGraph}
            disabled={isRefreshing}
            className="p-1 bg-dash-panel border border-dash-line hover:bg-dash-surface transition-colors rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-1 bg-dash-panel border border-dash-line hover:bg-dash-surface transition-colors rounded">
            <Maximize2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {dimensions.width > 0 && data.nodes.length > 0 && (
        <ForceGraph2D
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="rgba(0,0,0,0)"
          nodeAutoColorBy="group"
          nodeLabel="id"
          nodeVal={2}
          linkColor={() => "#4A5568"}
          linkWidth={0.5}
          linkDirectionalParticles={0}
          nodeRelSize={3}
          linkDistance={400}
          d3AlphaDecay={0.005}
          d3VelocityDecay={0.05}
          d3Force="charge"
          d3ForceStrength={-2000}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 8/globalScale;
            const nodeSize = 4;
            
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth + fontSize * 0.4, fontSize * 1.2];

            // Draw small node circle
            ctx.fillStyle = node.color || '#6366f1';
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
            ctx.fill();

            // Draw small label background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y + nodeSize + 3,
              bckgDimensions[0],
              bckgDimensions[1]
            );

            // Draw small label text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(label, node.x, node.y + nodeSize + 3 + bckgDimensions[1] / 2);
          }}
          onNodeClick={(node: any) => {
             console.log("Clicked concept:", node.id);
          }}
          cooldownTicks={400}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.2}
          maxZoom={8}
        />
      )}

      <div className="absolute bottom-3 left-3 z-10 text-[9px] text-dash-muted font-mono bg-dash-panel/50 px-2 py-1 border border-dash-line rounded uppercase">
        Query: MATCH (n)-[r:INFLUENCES]-&gt;(m)
      </div>

      <div className="absolute bottom-3 right-3 z-10 bg-dash-panel/80 p-2 text-[8px] mono-label border border-dash-line rounded">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span>Core Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.4)]" />
          <span>Sub-Topic</span>
        </div>
      </div>
    </div>
  );
}
