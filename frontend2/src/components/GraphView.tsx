import React, { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Maximize2, RefreshCw, Network } from 'lucide-react';

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
    <div ref={containerRef} className="relative w-full h-full bg-gradient-to-br from-cyber-bg to-cyber-panel overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-cyber-accent bg-cyber-panel/90 backdrop-blur-sm px-3 py-2 rounded-xl border-2 border-cyber-accent font-mono cyber-glow">
          <Network className="w-4 h-4 inline mr-2" />
          Knowledge Graph
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={fetchGraph}
            disabled={isRefreshing}
            className="p-2 bg-cyber-panel/90 backdrop-blur-sm border-2 border-cyber-line hover:border-cyber-accent transition-colors rounded-xl disabled:opacity-50 cyber-glow"
          >
            <RefreshCw className={`w-4 h-4 text-cyber-accent ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 bg-cyber-panel/90 backdrop-blur-sm border-2 border-cyber-line hover:border-cyber-accent transition-colors rounded-xl cyber-glow">
            <Maximize2 className="w-4 h-4 text-cyber-accent" />
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
          linkColor={() => "#14b8a6"}
          linkWidth={2}
          linkDirectionalParticles={3}
          linkDirectionalParticleWidth={3}
          linkDirectionalParticleColor={() => "#14b8a6"}
          nodeRelSize={5}
          linkDistance={60}
          d3AlphaDecay={0.01}
          d3VelocityDecay={0.1}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 11/globalScale;
            const nodeSize = 6;
            
            ctx.font = `${fontSize}px monospace`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth + fontSize * 0.5, fontSize * 1.5];

            // Draw node with glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#14b8a6';
            ctx.fillStyle = node.color || '#14b8a6';
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw label background
            ctx.fillStyle = 'rgba(17, 24, 39, 0.95)';
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y + nodeSize + 5,
              bckgDimensions[0],
              bckgDimensions[1]
            );

            // Draw label border
            ctx.strokeStyle = '#14b8a6';
            ctx.lineWidth = 1;
            ctx.strokeRect(
              node.x - bckgDimensions[0] / 2,
              node.y + nodeSize + 5,
              bckgDimensions[0],
              bckgDimensions[1]
            );

            // Draw label text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#14b8a6';
            ctx.fillText(label, node.x, node.y + nodeSize + 5 + bckgDimensions[1] / 2);
          }}
          onNodeClick={(node: any) => {
             console.log("Node selected:", node.id);
          }}
          cooldownTicks={100}
          enableNodeDrag={true}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.3}
          maxZoom={10}
        />
      )}

      <div className="absolute bottom-4 right-4 z-10 bg-cyber-panel/90 backdrop-blur-sm p-3 text-xs border-2 border-cyber-accent rounded-xl font-mono cyber-glow">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 rounded-full bg-teal-500 cyber-glow" style={{ boxShadow: '0 0 10px #14b8a6' }} />
          <span className="text-cyber-text">Core Node</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-cyan-500 cyber-glow" style={{ boxShadow: '0 0 10px #06b6d4' }} />
          <span className="text-cyber-text">Sub-Node</span>
        </div>
      </div>
    </div>
  );
}
