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
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
        <h2 className="text-sm font-semibold text-white bg-black/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-sm">
          Knowledge Graph
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={fetchGraph}
            disabled={isRefreshing}
            className="p-2 bg-black/90 backdrop-blur-sm border border-white/20 hover:bg-black transition-colors rounded-lg shadow-sm disabled:opacity-50 text-white"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button className="p-2 bg-black/90 backdrop-blur-sm border border-white/20 hover:bg-black transition-colors rounded-lg shadow-sm text-white">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {dimensions.width > 0 && data.nodes.length > 0 && (
        <ForceGraph2D
          graphData={data}
          width={dimensions.width}
          height={dimensions.height}
          backgroundColor="#000000"
          nodeAutoColorBy="group"
          nodeLabel="id"
          nodeVal={2}
          linkColor={() => "#ffffff"}
          linkWidth={1.5}
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
            ctx.fillStyle = node.color || '#ffffff';
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

      <div className="absolute bottom-4 right-4 z-10 bg-black/90 backdrop-blur-sm p-3 text-xs border border-white/20 rounded-xl shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-white" />
          <span className="text-white font-medium">Core Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-white font-medium">Sub-Topic</span>
        </div>
      </div>
    </div>
  );
}
