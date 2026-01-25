import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { SystemNode, ReadinessStatus, TestAsset } from '../types';

interface TestWorkflowProps {
  system: SystemNode;
  selectedAssetId: string | null;
  onSelectAsset: (asset: TestAsset | null) => void;
  onNavigateToParent?: () => void;
}

const CANVAS_SIZE = 5000;
const VIEWPORT_CENTER = 2500;
const ASSET_CARD_WIDTH = 320;
const ASSET_CARD_HEIGHT = 160; 
const TERMINAL_SIZE = 120;
const HORIZONTAL_SPACING = 500;
const VERTICAL_GAP = 50;

const TestWorkflow: React.FC<TestWorkflowProps> = ({ 
  system, 
  selectedAssetId, 
  onSelectAsset,
  onNavigateToParent 
}) => {
  const assets = system.testAssets;
  const subsystems = system.subsystems || [];
  const [zoom, setZoom] = useState(0.85);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevZoomRef = useRef<number>(zoom);
  const isProgrammaticZoomRef = useRef(false);
  const targetCenterRef = useRef<{ x: number, y: number, smooth: boolean } | null>(null);
  
  const [isPanning, setIsPanning] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0, moved: false });

  // Geometry calculations
  const totalAssetsHeight = assets.length * (ASSET_CARD_HEIGHT + VERTICAL_GAP) - VERTICAL_GAP;
  const startY = VIEWPORT_CENTER - totalAssetsHeight / 2;
  const beginX = VIEWPORT_CENTER - HORIZONTAL_SPACING;
  const endX = VIEWPORT_CENTER + HORIZONTAL_SPACING;
  const assetsX = VIEWPORT_CENTER - ASSET_CARD_WIDTH / 2;

  // Subsystem terminal layout
  const subsystemsX = beginX - HORIZONTAL_SPACING;
  const totalSubsystemsHeight = subsystems.length * (TERMINAL_SIZE + 100) - 100;
  const subStartY = VIEWPORT_CENTER - totalSubsystemsHeight / 2;

  const handleFitToView = useCallback((smooth = true) => {
    if (!containerRef.current) return;

    // Calculate bounds of the content
    const leftBound = subsystems.length > 0 ? subsystemsX : beginX;
    const rightBound = endX + TERMINAL_SIZE;
    
    // Y bounds considering terminals and assets
    const topBound = Math.min(
      subsystems.length > 0 ? subStartY : (VIEWPORT_CENTER - TERMINAL_SIZE / 2),
      assets.length > 0 ? startY : (VIEWPORT_CENTER - TERMINAL_SIZE / 2)
    );
    const bottomBound = Math.max(
      subsystems.length > 0 ? (subStartY + totalSubsystemsHeight + 100) : (VIEWPORT_CENTER + TERMINAL_SIZE / 2 + 100),
      assets.length > 0 ? (startY + totalAssetsHeight) : (VIEWPORT_CENTER + TERMINAL_SIZE / 2)
    );

    const contentWidth = rightBound - leftBound;
    const contentHeight = bottomBound - topBound;
    
    const viewportWidth = containerRef.current.clientWidth;
    const viewportHeight = containerRef.current.clientHeight;
    
    const padding = 120;
    const targetZoomX = viewportWidth / (contentWidth + padding * 2);
    const targetZoomY = viewportHeight / (contentHeight + padding * 2);
    
    const newZoom = Math.min(targetZoomX, targetZoomY, 1.0); 
    const centerX = (leftBound + rightBound) / 2;
    const centerY = (topBound + bottomBound) / 2;

    // If zoom is essentially unchanged, just scroll immediately
    if (Math.abs(newZoom - zoom) < 0.001) {
      containerRef.current.scrollTo({
        left: centerX * zoom - viewportWidth / 2,
        top: centerY * zoom - viewportHeight / 2,
        behavior: smooth ? 'smooth' : 'auto'
      });
      return;
    }

    // Otherwise, stage the centering for after the zoom state is applied to the DOM
    targetCenterRef.current = { x: centerX, y: centerY, smooth };
    isProgrammaticZoomRef.current = true;
    setZoom(newZoom);
  }, [subsystems, assets, beginX, endX, subsystemsX, subStartY, totalSubsystemsHeight, startY, totalAssetsHeight, zoom]);

  useLayoutEffect(() => {
    if (containerRef.current && prevZoomRef.current !== zoom) {
      const container = containerRef.current;
      const { clientWidth, clientHeight, scrollLeft, scrollTop } = container;

      // Only apply focal point preservation if it was a user zoom (not a fit-to-view call)
      if (isProgrammaticZoomRef.current && targetCenterRef.current) {
        const { x, y, smooth } = targetCenterRef.current;
        container.scrollTo({
          left: x * zoom - clientWidth / 2,
          top: y * zoom - clientHeight / 2,
          behavior: smooth ? 'smooth' : 'auto'
        });
        targetCenterRef.current = null;
      } else if (!isProgrammaticZoomRef.current) {
        const centerX = (scrollLeft + clientWidth / 2) / prevZoomRef.current;
        const centerY = (scrollTop + clientHeight / 2) / prevZoomRef.current;
        container.scrollLeft = centerX * zoom - clientWidth / 2;
        container.scrollTop = centerY * zoom - clientHeight / 2;
      }
      isProgrammaticZoomRef.current = false;
    }
    prevZoomRef.current = zoom;
  }, [zoom]);

  // Handle system change - CRITICAL FIX: Only run when system.id changes, not on every zoom update
  useEffect(() => {
    const timer = setTimeout(() => {
      // Use the function directly without it being in dependency to avoid re-triggering on zoom
      handleFitToView(false); 
    }, 50);
    return () => clearTimeout(timer);
  }, [system.id]); // Removed handleFitToView from dependency array

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: containerRef.current?.scrollLeft || 0,
      scrollTop: containerRef.current?.scrollTop || 0,
      moved: false
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPanning || !containerRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        dragRef.current.moved = true;
      }

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
      setZoom(z => Math.min(Math.max(z * factor, 0.2), 2));
    }
  };

  const getStatusColor = (status: ReadinessStatus) => {
    switch (status) {
      case ReadinessStatus.AVAILABLE: return 'text-status-available border-status-available';
      case ReadinessStatus.IN_PROGRESS: return 'text-status-progress border-status-progress';
      case ReadinessStatus.NOT_MADE: return 'text-status-notmade border-status-notmade';
      case ReadinessStatus.DEFERRED: return 'text-status-deferred border-status-deferred';
      default: return 'text-slate-400 border-slate-400';
    }
  };

  const getStatusBg = (status: ReadinessStatus) => {
    switch (status) {
      case ReadinessStatus.AVAILABLE: return 'bg-status-available';
      case ReadinessStatus.IN_PROGRESS: return 'bg-status-progress';
      case ReadinessStatus.NOT_MADE: return 'bg-status-notmade';
      case ReadinessStatus.DEFERRED: return 'bg-status-deferred';
      default: return 'bg-slate-500';
    }
  };

  const getStatusIcon = (status: ReadinessStatus) => {
    switch (status) {
      case ReadinessStatus.AVAILABLE: return 'check_circle';
      case ReadinessStatus.IN_PROGRESS: return 'settings_backup_restore';
      case ReadinessStatus.NOT_MADE: return 'construction';
      case ReadinessStatus.DEFERRED: return 'motion_photos_paused';
      default: return 'help';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!dragRef.current.moved) {
      onSelectAsset(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#06090c] overflow-hidden relative" onClick={handleCanvasClick}>
      {/* HUD Header */}
      <div className="absolute top-0 left-0 right-0 px-8 py-4 border-b border-white/5 bg-background-dark/80 backdrop-blur-xl z-[70] flex items-center justify-between pointer-events-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-4">
          {onNavigateToParent && (
            <button 
              onClick={(e) => { e.stopPropagation(); onNavigateToParent(); }}
              onMouseDown={(e) => e.stopPropagation()}
              className="mr-2 size-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all shadow-lg group"
              title="Navigate to Parent System"
            >
              <span className="material-symbols-outlined group-hover:-translate-y-0.5 transition-transform">arrow_upward</span>
            </button>
          )}
          <div className="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">hub</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight leading-none mb-1">{system.name}</h2>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Interactive Workflow Interface</p>
          </div>
        </div>
        <div className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">
          ZOOM: {(zoom * 100).toFixed(0)}%
        </div>
      </div>

      {/* Floating Status Legend */}
      <div className="absolute top-24 left-8 flex flex-col gap-2 z-[65]" onClick={e => e.stopPropagation()}>
        <div className="bg-background-dark/90 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${getStatusBg(ReadinessStatus.AVAILABLE)}`}></div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${getStatusBg(ReadinessStatus.IN_PROGRESS)}`}></div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">In-Work</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${getStatusBg(ReadinessStatus.NOT_MADE)}`}></div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">Pending</span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-[60]" onClick={e => e.stopPropagation()}>
        <button 
          onClick={() => handleFitToView(true)} 
          onMouseDown={(e) => e.stopPropagation()}
          className="size-11 bg-background-dark/90 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-primary shadow-xl transition-all"
          title="Fit to View"
        >
          <span className="material-symbols-outlined">center_focus_weak</span>
        </button>
        <div className="h-px bg-white/10 w-8 mx-auto my-1"></div>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="size-11 bg-background-dark/90 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 shadow-xl transition-all">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setZoom(z => Math.max(z - 0.1, 0.2))} className="size-11 bg-background-dark/90 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 shadow-xl transition-all">
          <span className="material-symbols-outlined">remove</span>
        </button>
      </div>

      {/* Canvas Viewport */}
      <div 
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        className={`w-full h-full overflow-auto no-scrollbar select-none canvas-grid ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
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
            <svg className="absolute inset-0 pointer-events-none" width={CANVAS_SIZE} height={CANVAS_SIZE}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                </marker>
                <marker id="arrowhead-primary" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
                </marker>
                <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#a78bfa" />
                </marker>
              </defs>

              {/* Subsystem to Begin lines */}
              {subsystems.map((sub, idx) => {
                const subY = subStartY + idx * (TERMINAL_SIZE + 100) + TERMINAL_SIZE / 2;
                const startX = subsystemsX + TERMINAL_SIZE;
                const endXPos = beginX;
                const endYPos = VIEWPORT_CENTER;
                return (
                  <path 
                    key={`sub-line-${sub.id}`}
                    d={`M ${startX} ${subY} C ${startX + 100} ${subY}, ${endXPos - 100} ${endYPos}, ${endXPos} ${endYPos}`}
                    className="fill-none stroke-slate-300 stroke-[2px] opacity-80"
                    markerEnd="url(#arrowhead-primary)"
                  />
                );
              })}

              {/* Begin to Assets lines */}
              {assets.map((asset, idx) => {
                const isSelected = selectedAssetId === asset.id;
                const assetY = startY + idx * (ASSET_CARD_HEIGHT + VERTICAL_GAP) + ASSET_CARD_HEIGHT / 2;
                const beginTerminalX = beginX + TERMINAL_SIZE;
                const beginTerminalY = VIEWPORT_CENTER;
                const endTerminalX = endX;
                const endTerminalY = VIEWPORT_CENTER;

                return (
                  <g key={`lines-${asset.id}`}>
                    <path 
                      d={`M ${beginTerminalX} ${beginTerminalY} C ${beginTerminalX + 100} ${beginTerminalY}, ${assetsX - 100} ${assetY}, ${assetsX} ${assetY}`}
                      className={`fill-none transition-all duration-500 ${isSelected ? 'stroke-violet-400 stroke-[3] opacity-100' : 'stroke-slate-300 stroke-[1.5px] opacity-70'}`}
                      strokeDasharray={isSelected ? '0' : '0'}
                      markerEnd={isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead-primary)'}
                    />
                    <path 
                      d={`M ${assetsX + ASSET_CARD_WIDTH} ${assetY} C ${assetsX + ASSET_CARD_WIDTH + 100} ${assetY}, ${endTerminalX - 100} ${endTerminalY}, ${endTerminalX} ${endTerminalY}`}
                      className={`fill-none transition-all duration-500 ${isSelected ? 'stroke-violet-400/50 stroke-[2.5] opacity-100' : 'stroke-slate-300 stroke-[1.5px] opacity-50'}`}
                      markerEnd={isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Subsystem Terminals */}
            {subsystems.map((sub, idx) => {
              const subY = subStartY + idx * (TERMINAL_SIZE + 100);
              return (
                <div 
                  key={`sub-terminal-${sub.id}`}
                  className="absolute flex flex-col items-center gap-4 group" 
                  style={{ left: subsystemsX, top: subY }}
                >
                  <div className="size-[120px] rounded-full border-4 border-primary/40 bg-primary/5 flex items-center justify-center shadow-[0_0_30px_rgba(0,192,202,0.1)] group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-5xl text-primary font-bold">login</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-white uppercase tracking-widest leading-tight">
                      Subsystem Testing Complete:
                      <br />
                      <span className="text-[11px] font-medium text-slate-500 mt-2 uppercase tracking-wide block">
                        {sub.name}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Begin Terminal */}
            <div 
              className="absolute flex flex-col items-center gap-4 group" 
              style={{ left: beginX, top: VIEWPORT_CENTER - TERMINAL_SIZE / 2 }}
            >
              <div className="size-[120px] rounded-full border-4 border-primary/40 bg-primary/5 flex items-center justify-center shadow-[0_0_50px_rgba(0,192,202,0.15)] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-5xl text-primary font-bold">login</span>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white uppercase tracking-widest leading-tight">
                  Begin<br />System Testing
                </p>
              </div>
            </div>

            {/* Asset Cards */}
            {assets.length === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-slate-800">playlist_remove</span>
                    <p className="text-slate-500 max-w-sm mx-auto uppercase tracking-widest font-bold">No Test Assets In This System</p>
                  </div>
               </div>
            ) : (
              assets.map((asset, idx) => {
                const isSelected = selectedAssetId === asset.id;
                return (
                  <div 
                    key={asset.id}
                    onMouseDown={(e) => e.stopPropagation()} 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onSelectAsset(asset); 
                    }}
                    className={`absolute w-[320px] bg-[#0d141d] border-2 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.04] hover:z-50 cursor-pointer group active:scale-[0.98] ${
                      isSelected 
                        ? 'border-violet-400 shadow-[0_0_40px_rgba(167,139,250,0.25)] z-40 scale-[1.05]' 
                        : 'border-white/5 hover:border-violet-400/40'
                    }`}
                    style={{ left: assetsX, top: startY + idx * (ASSET_CARD_HEIGHT + VERTICAL_GAP) }}
                  >
                    <div className={`px-4 py-2 border-b flex items-center justify-between ${isSelected ? 'bg-violet-400/10 border-violet-400/20' : 'bg-white/5 border-white/5'}`}>
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-violet-300' : 'text-slate-500'}`}>{asset.id}</span>
                      <div className={`size-2 rounded-full ${getStatusBg(asset.status)}`}></div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-bold text-base truncate transition-colors ${isSelected ? 'text-violet-100' : 'text-white group-hover:text-violet-400'}`}>
                          {asset.name}
                        </h4>
                        <span className={`material-symbols-outlined text-xl transition-all ${isSelected ? 'text-violet-400 scale-110' : 'text-slate-600'}`}>
                          {getStatusIcon(asset.status)}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-2 leading-relaxed h-8 transition-colors ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {asset.description}
                      </p>
                    </div>
                    
                    <div className={`px-4 py-3 flex items-center justify-between transition-all ${
                      isSelected ? 'bg-violet-400/20' : 'bg-slate-900/40 group-hover:bg-violet-400/5'
                    }`}>
                       <div className="flex flex-col">
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Status</span>
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${getStatusColor(asset.status).split(' ')[0]}`}>
                            {asset.status.replace(/_/g, ' ')}
                          </span>
                       </div>
                       <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/5 bg-slate-950/50 group-hover:border-violet-400/30 transition-all">
                          <span className={`text-[9px] font-bold tracking-widest ${isSelected ? 'text-violet-400' : 'text-slate-400'}`}>
                            {isSelected ? 'ACTIVE FOCUS' : 'VIEW DETAILS'}
                          </span>
                          <span className={`material-symbols-outlined text-xs ${isSelected ? 'text-violet-400 animate-pulse' : 'text-slate-600'}`}>
                            {isSelected ? 'data_exploration' : 'arrow_forward'}
                          </span>
                       </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* End Terminal */}
            <div 
              className={`absolute flex flex-col items-center gap-4 group ${onNavigateToParent ? 'cursor-pointer' : ''}`} 
              style={{ left: endX, top: VIEWPORT_CENTER - TERMINAL_SIZE / 2 }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (onNavigateToParent) onNavigateToParent();
              }}
            >
              <div className={`size-[120px] rounded-full border-4 bg-primary/5 flex items-center justify-center transition-all border-primary/40 shadow-[0_0_50px_rgba(0,192,202,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(0,192,202,0.25)]`}>
                <span className="material-symbols-outlined text-5xl font-bold text-primary">
                  {onNavigateToParent ? 'arrow_upward' : 'logout'}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white uppercase tracking-widest leading-tight group-hover:text-primary transition-colors">
                  System Testing<br />Complete
                </p>
                {onNavigateToParent && (
                  <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest mt-2 group-hover:text-primary">Go to Parent System</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dash-anim {
          animation: dashoffset 1.5s linear infinite;
        }
        @keyframes dashoffset {
          from { stroke-dashoffset: 12; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};

export default TestWorkflow;