import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { SystemNode, ReadinessStatus, TestAsset } from '../types';

interface GraphCanvasProps {
  rootNode: SystemNode;
  selectedId: string;
  onSelect: (node: SystemNode) => void;
  expandedNodes: Set<string>;
  onToggleExpand: (id: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  searchQuery: string;
}

const CANVAS_SIZE = 12000; 
const ROOT_START_X = 8000; 
const ROOT_START_Y = 6000;
const NODE_WIDTH = 240; 
const NODE_HEIGHT = 160; 
const HORIZONTAL_GAP = 480; 
const VERTICAL_GAP = 280;   

/**
 * Utility to compute the derived status of a node based on its local and recursive assets.
 */
export const getComputedNodeStatus = (node: SystemNode): ReadinessStatus => {
  const allAssets: TestAsset[] = [];
  
  const collect = (n: SystemNode) => {
    allAssets.push(...n.testAssets);
    n.subsystems?.forEach(collect);
  };
  collect(node);

  if (allAssets.length === 0) return ReadinessStatus.DEFERRED;

  const allDeferred = allAssets.every(a => a.status === ReadinessStatus.DEFERRED);
  if (allDeferred) return ReadinessStatus.DEFERRED;

  // For mix logic, treat DEFERRED as AVAILABLE (Done)
  const normalizedStatuses = allAssets.map(a => 
    a.status === ReadinessStatus.DEFERRED ? ReadinessStatus.AVAILABLE : a.status
  );

  const allAvailable = normalizedStatuses.every(s => s === ReadinessStatus.AVAILABLE);
  if (allAvailable) return ReadinessStatus.AVAILABLE;

  const allNotMade = normalizedStatuses.every(s => s === ReadinessStatus.NOT_MADE);
  if (allNotMade) return ReadinessStatus.NOT_MADE;

  return ReadinessStatus.IN_PROGRESS;
};

/**
 * Calculates how many leaf nodes are in the visible (expanded) subtree.
 * Used to determine how much vertical space to allocate.
 */
const getSubtreeLeafCount = (node: SystemNode, expandedNodes: Set<string>): number => {
  if (!expandedNodes.has(node.id) || !node.subsystems || node.subsystems.length === 0) {
    return 1;
  }
  return node.subsystems.reduce((acc, sub) => acc + getSubtreeLeafCount(sub, expandedNodes), 0);
};

const GraphCanvas: React.FC<GraphCanvasProps> = ({ 
  rootNode, 
  selectedId, 
  onSelect, 
  expandedNodes, 
  onToggleExpand, 
  onExpandAll, 
  onCollapseAll,
  searchQuery
}) => {
  const [zoom, setZoom] = useState(0.8); 
  const containerRef = useRef<HTMLDivElement>(null);
  const prevZoomRef = useRef<number>(zoom);
  
  // Panning State
  const [isPanning, setIsPanning] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 });

  // Map to store absolute node positions for centering
  const nodePositions = useRef<Map<string, { x: number, y: number }>>(new Map());

  // Effect to maintain zoom focal point (center of screen)
  useLayoutEffect(() => {
    if (containerRef.current && prevZoomRef.current !== zoom) {
      const container = containerRef.current;
      const { clientWidth, clientHeight, scrollLeft, scrollTop } = container;

      // Calculate the world coordinate of the current viewport center
      const centerX = (scrollLeft + clientWidth / 2) / prevZoomRef.current;
      const centerY = (scrollTop + clientHeight / 2) / prevZoomRef.current;

      // Calculate the new scroll positions to keep that world coordinate centered
      container.scrollLeft = centerX * zoom - clientWidth / 2;
      container.scrollTop = centerY * zoom - clientHeight / 2;
    }
    prevZoomRef.current = zoom;
  }, [zoom]);

  const centerOnNode = (id: string, smooth = true) => {
    const pos = nodePositions.current.get(id);
    if (pos && containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      // Calculate target scroll position to center the node in the viewport
      const targetX = (pos.x * zoom) - (clientWidth / 2) + (NODE_WIDTH * zoom / 2);
      const targetY = (pos.y * zoom) - (clientHeight / 2) + (NODE_HEIGHT * zoom / 2);
      
      containerRef.current.scrollTo({
        left: targetX,
        top: targetY,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // Initial center on root
  useEffect(() => {
    const timer = setTimeout(() => centerOnNode(rootNode.id, false), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-center when selection changes
  useEffect(() => {
    if (selectedId) {
      const timer = setTimeout(() => centerOnNode(selectedId, true), 100);
      return () => clearTimeout(timer);
    }
  }, [selectedId]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    if (e.button !== 0) return;
    
    setIsPanning(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: containerRef.current.scrollLeft,
      scrollTop: containerRef.current.scrollTop
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning || !containerRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      containerRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
      containerRef.current.scrollTop = dragRef.current.scrollTop - dy;
    };

    const handleMouseUp = () => setIsPanning(false);

    if (isPanning) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isPanning]);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      const factor = Math.pow(1.1, delta / 100);
      setZoom(z => Math.min(Math.max(z * factor, 0.2), 3));
    }
  };

  const getStatusColor = (status: ReadinessStatus) => {
    switch (status) {
      case ReadinessStatus.AVAILABLE: return 'border-status-available';
      case ReadinessStatus.IN_PROGRESS: return 'border-status-progress';
      case ReadinessStatus.NOT_MADE: return 'border-status-notmade';
      case ReadinessStatus.DEFERRED: return 'border-status-deferred';
      default: return 'border-slate-400';
    }
  };

  const getStatusIconColor = (status: ReadinessStatus) => {
    switch (status) {
      case ReadinessStatus.AVAILABLE: return 'text-status-available';
      case ReadinessStatus.IN_PROGRESS: return 'text-status-progress';
      case ReadinessStatus.NOT_MADE: return 'text-status-notmade';
      case ReadinessStatus.DEFERRED: return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const renderNodesFlat = (node: SystemNode, x: number, y: number): React.ReactElement[] => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedId === node.id;
    const computedStatus = getComputedNodeStatus(node);
    
    const normalizedQuery = searchQuery.toLowerCase();
    const isMatch = searchQuery.length > 1 && (
      node.id.toLowerCase().includes(normalizedQuery) || 
      node.name.toLowerCase().includes(normalizedQuery)
    );
    
    nodePositions.current.set(node.id, { x, y });

    let elements: React.ReactElement[] = [];

    // Check if the node is "positive" status (Ready or In Progress) for fuller border highlighting
    const isPositiveStatus = computedStatus === ReadinessStatus.AVAILABLE || computedStatus === ReadinessStatus.IN_PROGRESS;

    // Main Node Component
    elements.push(
      <div 
        key={node.id} 
        style={{ 
          position: 'absolute', 
          left: x, 
          top: y, 
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isSelected ? 50 : 10
        }}
      >
        <div 
          onClick={(e) => { e.stopPropagation(); onSelect(node); }}
          onMouseDown={(e) => e.stopPropagation()}
          className={`
            relative w-60 min-h-[160px] bg-node-bg shadow-2xl overflow-visible rounded-sm cursor-pointer group transition-all duration-300
            ${isPositiveStatus 
              ? `border-2 ${getStatusColor(computedStatus)}` 
              : `border border-white/10 border-r-4 ${getStatusColor(computedStatus)}`
            }
            ${isSelected ? 'outline outline-2 outline-primary outline-offset-4 shadow-[0_0_25px_rgba(0,192,202,0.4)]' : ''}
            ${isMatch ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-background-dark animate-pulse' : ''}
          `}
        >
          {node.subsystems && node.subsystems.length > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
              onMouseDown={(e) => e.stopPropagation()}
              className={`absolute left-[-14px] top-1/2 -translate-y-1/2 z-30 size-7 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl
                ${isExpanded ? 'text-primary border-primary/50' : 'text-slate-400'}
              `}
            >
              <span className="material-symbols-outlined text-base">
                {isExpanded ? 'chevron_left' : 'chevron_right'}
              </span>
            </button>
          )}
          
          <div className="h-20 w-full bg-cover bg-center relative overflow-hidden" style={{ backgroundImage: `url(${node.imageUrl})` }}>
            <div className="absolute inset-0 node-image-overlay opacity-80"></div>
            <div className="absolute bottom-2 right-2 flex gap-1">
               {node.subsystems && node.subsystems.length > 0 && (
                 <span className="text-[9px] bg-slate-800/80 text-slate-300 px-1.5 py-0.5 rounded border border-white/5 backdrop-blur-sm">
                   {node.subsystems.length} Subsystems
                 </span>
               )}
            </div>
          </div>

          <div className="p-4 pt-2 relative">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">{node.id}</span>
              <span className={`material-symbols-outlined ${getStatusIconColor(computedStatus)} text-xs`}>
                {computedStatus === ReadinessStatus.AVAILABLE ? 'check_circle' : 
                 computedStatus === ReadinessStatus.NOT_MADE ? 'error_outline' :
                 computedStatus === ReadinessStatus.DEFERRED ? 'block' : 'radio_button_checked'}
              </span>
            </div>
            <h4 className="text-white font-bold leading-tight mb-2 group-hover:text-primary transition-colors text-sm">{node.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-medium">{node.owner}</span>
            </div>
          </div>
        </div>
      </div>
    );

    // Recursively render children with subtree logic
    if (isExpanded && node.subsystems) {
      const childX = x - HORIZONTAL_GAP;
      
      const totalLeafCount = getSubtreeLeafCount(node, expandedNodes);
      // Start the children layout from a centered Y offset
      let currentYOffset = -(totalLeafCount - 1) * VERTICAL_GAP / 2;

      node.subsystems.forEach((sub) => {
        const subLeafCount = getSubtreeLeafCount(sub, expandedNodes);
        
        // The child Y position is calculated to be the center of its own subtree height
        const childY = y + currentYOffset + (subLeafCount - 1) * VERTICAL_GAP / 2;
        
        // Prepare for the next sibling by skipping over the entire height of this subtree
        currentYOffset += subLeafCount * VERTICAL_GAP;

        // Connector lines math - extend start and end to penetrate nodes slightly to avoid visual gaps
        const startX = x + 4; 
        const startY = y + NODE_HEIGHT / 2;
        const endX = childX + NODE_WIDTH - 4;
        const endY = childY + NODE_HEIGHT / 2;

        const minX = Math.min(startX, endX);
        const minY = Math.min(startY, endY);
        const width = Math.abs(startX - endX);
        const height = Math.abs(startY - endY) + 2;

        elements.push(
          <svg 
            key={`connector-${sub.id}`}
            className="absolute pointer-events-none overflow-visible" 
            style={{ 
              left: minX, 
              top: minY, 
              width: width, 
              height: height,
              zIndex: 0
            }}
          >
            <path 
              className={isSelected || selectedId === sub.id
                ? "stroke-primary stroke-[2.5px] opacity-100" 
                : "stroke-slate-300 stroke-[1.5px] opacity-70"
              }
              fill="none"
              strokeLinecap="round"
              style={{ transition: 'stroke 0.3s ease, opacity 0.3s ease' }}
              d={`
                M ${startX - minX} ${startY - minY} 
                C ${((startX - minX) + (endX - minX)) / 2} ${startY - minY}, 
                  ${((startX - minX) + (endX - minX)) / 2} ${endY - minY}, 
                  ${endX - minX} ${endY - minY}
              `}
            />
          </svg>
        );

        elements = [...elements, ...renderNodesFlat(sub, childX, childY)];
      });
    }

    return elements;
  };

  return (
    <div className="flex-1 relative bg-[#06090c] canvas-grid overflow-hidden">
      {/* HUD - Legend Overlay */}
      <div className="absolute top-6 left-6 flex flex-col gap-2 z-[60]">
        <div className="bg-background-dark/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl flex items-center gap-5" onMouseDown={e => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-status-available"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-status-progress"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-status-notmade"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Pending</span>
          </div>
        </div>
        
        <div className="bg-background-dark/90 backdrop-blur-md border border-white/10 p-2 rounded-lg shadow-2xl flex items-center gap-3 w-fit" onMouseDown={e => e.stopPropagation()}>
           <button onClick={onCollapseAll} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all">Collapse All</button>
           <button onClick={onExpandAll} className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 rounded transition-all">Expand All</button>
        </div>
      </div>

      {/* Navigation Tools */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-[60]" onMouseDown={e => e.stopPropagation()}>
        <button 
          onClick={() => centerOnNode(selectedId)} 
          title="Focus Selected"
          className="size-11 bg-background-dark/90 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-primary shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          <span className="material-symbols-outlined">center_focus_weak</span>
        </button>
        <div className="h-px bg-white/10 w-8 mx-auto my-1"></div>
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className="size-11 bg-background-dark/90 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 shadow-xl transition-all">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} className="size-11 bg-background-dark/90 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 shadow-xl transition-all">
          <span className="material-symbols-outlined">remove</span>
        </button>
      </div>

      {/* Viewport */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className={`w-full h-full overflow-auto no-scrollbar select-none ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ scrollbarWidth: 'none' }}
      >
        <div 
          style={{ 
            width: CANVAS_SIZE * zoom, 
            height: CANVAS_SIZE * zoom, 
            position: 'relative'
          }}
        >
          <div 
            style={{ 
              width: CANVAS_SIZE, 
              height: CANVAS_SIZE, 
              position: 'absolute',
              top: 0,
              left: 0,
              transform: `scale(${zoom})`,
              transformOrigin: '0 0',
              pointerEvents: isPanning ? 'none' : 'auto'
            }}
          >
            {renderNodesFlat(rootNode, ROOT_START_X, ROOT_START_Y)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphCanvas;