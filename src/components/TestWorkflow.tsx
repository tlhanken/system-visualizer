import React, { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { SystemNode, ReadinessStatus, TestAsset } from '../types';

interface TestWorkflowProps {
  system: SystemNode;
  selectedAssetId: string | null;
  onSelectAsset: (asset: TestAsset | null) => void;
  onNavigateToParent?: () => void;
  onNavigateToSubsystem?: (sub: SystemNode) => void;
}

const CANVAS_SIZE = 5000;
const VIEWPORT_CENTER = 2500;
const ASSET_CARD_WIDTH = 320;
const ASSET_CARD_HEIGHT = 125; 
const TERMINAL_SIZE = 120;
const HORIZONTAL_SPACING = 500;
const VERTICAL_GAP = 50;
const LINE_GAP = 6; // Increased gap for cleaner separation from terminal borders

interface AssetWithPos extends TestAsset {
  x: number;
  y: number;
  rank: number;
}

const TestWorkflow: React.FC<TestWorkflowProps> = ({ 
  system, 
  selectedAssetId, 
  onSelectAsset,
  onNavigateToParent,
  onNavigateToSubsystem
}) => {
  const assets = system.testAssets;
  const subsystems = system.subsystems || [];
  const [zoom, setZoom] = useState(0.85);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevZoomRef = useRef<number>(zoom);
  const zoomRef = useRef<number>(zoom); 
  const isProgrammaticZoomRef = useRef(false);
  const targetCenterRef = useRef<{ x: number, y: number, smooth: boolean } | null>(null);
  
  const [isPanning, setIsPanning] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0, moved: false });

  // Keep zoomRef in sync
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Compute Ranks and Positions for Assets
  const positionedAssets = useMemo(() => {
    if (assets.length === 0) return [];

    const assetMap = new Map<string, TestAsset>(assets.map(a => [a.id, a]));
    const ranks = new Map<string, number>();

    const getRank = (id: string): number => {
      if (ranks.has(id)) return ranks.get(id)!;
      const asset = assetMap.get(id);
      if (!asset || !asset.dependsOn || asset.dependsOn.length === 0) {
        ranks.set(id, 0);
        return 0;
      }
      const rank = Math.max(...asset.dependsOn.map(pId => getRank(pId))) + 1;
      ranks.set(id, rank);
      return rank;
    };

    assets.forEach(a => getRank(a.id));

    const rankGroups: Record<number, string[]> = {};
    assets.forEach(a => {
      const r = ranks.get(a.id) || 0;
      if (!rankGroups[r]) rankGroups[r] = [];
      rankGroups[r].push(a.id);
    });

    const maxRank = Math.max(...Object.keys(rankGroups).map(Number));
    const totalWorkflowWidth = (maxRank + 1) * ASSET_CARD_WIDTH + maxRank * (HORIZONTAL_SPACING / 2);
    const startX = VIEWPORT_CENTER - totalWorkflowWidth / 2;

    const result: AssetWithPos[] = [];
    Object.entries(rankGroups).forEach(([rankStr, ids]) => {
      const r = Number(rankStr);
      const colX = startX + r * (ASSET_CARD_WIDTH + HORIZONTAL_SPACING / 2);
      const colHeight = ids.length * (ASSET_CARD_HEIGHT + VERTICAL_GAP) - VERTICAL_GAP;
      const colStartY = VIEWPORT_CENTER - colHeight / 2;

      ids.forEach((id, idx) => {
        const asset = assetMap.get(id)!;
        result.push({
          ...asset,
          x: colX,
          y: colStartY + idx * (ASSET_CARD_HEIGHT + VERTICAL_GAP),
          rank: r
        });
      });
    });

    return result;
  }, [assets]);

  // Dimensions for fitting
  const firstColX = positionedAssets.length > 0 ? Math.min(...positionedAssets.map(a => a.x)) : VIEWPORT_CENTER - ASSET_CARD_WIDTH / 2;
  const lastColX = positionedAssets.length > 0 ? Math.max(...positionedAssets.map(a => a.x)) : VIEWPORT_CENTER - ASSET_CARD_WIDTH / 2;
  const beginX = firstColX - HORIZONTAL_SPACING / 1.5;
  const endX = lastColX + ASSET_CARD_WIDTH + HORIZONTAL_SPACING / 1.5 - TERMINAL_SIZE;
  const subsystemsX = beginX - HORIZONTAL_SPACING / 1.5;
  const totalSubsystemsHeight = subsystems.length * (TERMINAL_SIZE + 100) - 100;
  const subStartY = VIEWPORT_CENTER - totalSubsystemsHeight / 2;

  const handleFitToView = useCallback((smooth = true) => {
    if (!containerRef.current) return;

    const leftBound = subsystems.length > 0 ? subsystemsX : beginX;
    const rightBound = endX + TERMINAL_SIZE;
    
    const topBound = Math.min(
      subsystems.length > 0 ? subStartY : (VIEWPORT_CENTER - TERMINAL_SIZE / 2),
      positionedAssets.length > 0 ? Math.min(...positionedAssets.map(a => a.y)) : (VIEWPORT_CENTER - TERMINAL_SIZE / 2)
    );
    const bottomBound = Math.max(
      subsystems.length > 0 ? (subStartY + totalSubsystemsHeight + 100) : (VIEWPORT_CENTER + TERMINAL_SIZE / 2 + 100),
      positionedAssets.length > 0 ? Math.max(...positionedAssets.map(a => a.y + ASSET_CARD_HEIGHT)) : (VIEWPORT_CENTER + TERMINAL_SIZE / 2)
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

    const currentZoom = zoomRef.current;
    if (Math.abs(newZoom - currentZoom) < 0.01) {
      containerRef.current.scrollTo({
        left: centerX * currentZoom - viewportWidth / 2,
        top: centerY * currentZoom - viewportHeight / 2,
        behavior: smooth ? 'smooth' : 'auto'
      });
      return;
    }

    targetCenterRef.current = { x: centerX, y: centerY, smooth };
    isProgrammaticZoomRef.current = true;
    setZoom(newZoom);
  }, [subsystems.length, subsystemsX, beginX, endX, subStartY, totalSubsystemsHeight, positionedAssets]);

  useLayoutEffect(() => {
    if (containerRef.current && prevZoomRef.current !== zoom) {
      const container = containerRef.current;
      const { clientWidth, clientHeight, scrollLeft, scrollTop } = container;

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

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToView(false); 
    }, 100);
    return () => clearTimeout(timer);
  }, [system.id, handleFitToView]); 

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
      setZoom(z => Math.min(Math.max(z * factor, 0.1), 3));
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
      case ReadinessStatus.IN_PROGRESS: return 'radio_button_checked';
      case ReadinessStatus.NOT_MADE: return 'error_outline';
      case ReadinessStatus.DEFERRED: return 'block';
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
        <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className="size-11 bg-background-dark/90 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 shadow-xl transition-all">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button onMouseDown={(e) => e.stopPropagation()} onClick={() => setZoom(z => Math.max(z - 0.1, 0.1))} className="size-11 bg-background-dark/90 border border-white/10 rounded-lg flex items-center justify-center hover:bg-slate-800 text-slate-400 shadow-xl transition-all">
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
                  <polygon points="0 0, 10 3.5, 0 7" fill="#00c0ca" />
                </marker>
                <marker id="arrowhead-selected" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#a78bfa" />
                </marker>
              </defs>

              {/* Subsystem to Begin lines */}
              {subsystems.map((sub, idx) => {
                const subY = subStartY + idx * (TERMINAL_SIZE + 100) + TERMINAL_SIZE / 2;
                const startX = subsystemsX + TERMINAL_SIZE + LINE_GAP;
                const endXPos = beginX - LINE_GAP;
                const endYPos = VIEWPORT_CENTER;
                return (
                  <path 
                    key={`sub-line-${sub.id}`}
                    d={`M ${startX} ${subY} C ${startX + 50} ${subY}, ${endXPos - 50} ${endYPos}, ${endXPos} ${endYPos}`}
                    className="fill-none stroke-primary/30 stroke-[2px]"
                    markerEnd="url(#arrowhead-primary)"
                  />
                );
              })}

              {/* Begin to Rank-0 Assets lines */}
              {positionedAssets.filter(a => a.rank === 0).map(asset => {
                const startX = beginX + TERMINAL_SIZE + LINE_GAP;
                const endXPos = asset.x - LINE_GAP;
                const startYPos = VIEWPORT_CENTER;
                const endYPos = asset.y + ASSET_CARD_HEIGHT / 2;
                return (
                  <path 
                    key={`begin-to-${asset.id}`}
                    d={`M ${startX} ${startYPos} C ${startX + 50} ${startYPos}, ${endXPos - 50} ${endYPos}, ${endXPos} ${endYPos}`}
                    className="fill-none stroke-slate-300 stroke-[1.5px] opacity-50"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {/* Asset to Asset dependency lines */}
              {positionedAssets.map(asset => {
                const isSelected = selectedAssetId === asset.id;
                return (asset.dependsOn || []).map(pId => {
                  const predecessor = positionedAssets.find(pa => pa.id === pId);
                  if (!predecessor) return null;
                  
                  const startX = predecessor.x + ASSET_CARD_WIDTH + LINE_GAP;
                  const startYPos = predecessor.y + ASSET_CARD_HEIGHT / 2;
                  const endXPos = asset.x - LINE_GAP;
                  const endYPos = asset.y + ASSET_CARD_HEIGHT / 2;
                  const isPreSelected = selectedAssetId === predecessor.id;

                  return (
                    <path 
                      key={`${pId}-to-${asset.id}`}
                      d={`M ${startX} ${startYPos} C ${startX + 50} ${startYPos}, ${endXPos - 50} ${endYPos}, ${endXPos} ${endYPos}`}
                      className={`fill-none transition-all duration-500 ${
                        isSelected || isPreSelected ? 'stroke-violet-400 stroke-[2.5] opacity-100' : 'stroke-slate-300 stroke-[1.5px] opacity-40'
                      }`}
                      markerEnd={isSelected || isPreSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'}
                    />
                  );
                });
              })}

              {/* Terminal Col to End Terminal lines */}
              {positionedAssets.filter(asset => {
                return !positionedAssets.some(other => other.dependsOn?.includes(asset.id));
              }).map(asset => {
                const isSelected = selectedAssetId === asset.id;
                const startX = asset.x + ASSET_CARD_WIDTH + LINE_GAP;
                const startYPos = asset.y + ASSET_CARD_HEIGHT / 2;
                const endXPos = endX - LINE_GAP;
                const endYPos = VIEWPORT_CENTER;

                return (
                  <path 
                    key={`${asset.id}-to-end`}
                    d={`M ${startX} ${startYPos} C ${startX + 50} ${startYPos}, ${endXPos - 50} ${endYPos}, ${endXPos} ${endYPos}`}
                    className={`fill-none transition-all duration-500 ${
                      isSelected ? 'stroke-violet-400 stroke-[2.5] opacity-100' : 'stroke-slate-300 stroke-[1.5px] opacity-40'
                    }`}
                    markerEnd={isSelected ? 'url(#arrowhead-selected)' : 'url(#arrowhead)'}
                  />
                );
              })}
            </svg>

            {/* Subsystem Terminals */}
            {subsystems.map((sub, idx) => {
              const subY = subStartY + idx * (TERMINAL_SIZE + 100);
              return (
                <div 
                  key={`sub-terminal-${sub.id}`}
                  className="absolute flex flex-col items-center gap-4 group cursor-pointer w-[120px] overflow-visible" 
                  style={{ left: subsystemsX, top: subY }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onNavigateToSubsystem) onNavigateToSubsystem(sub);
                  }}
                >
                  <div className="size-[120px] shrink-0 rounded-full border-4 border-primary/40 bg-primary/5 flex items-center justify-center shadow-[0_0_30px_rgba(0,192,202,0.1)] group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-5xl text-primary font-bold">login</span>
                  </div>
                  <div className="text-center w-max">
                    <p className="text-sm font-bold text-white uppercase tracking-widest leading-tight">
                      Subsystem Testing Complete:
                      <br />
                      <span className="text-[13px] font-bold text-primary mt-2 uppercase tracking-wide block">
                        {sub.name}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Begin Terminal */}
            <div 
              className="absolute flex flex-col items-center gap-4 group w-[120px] overflow-visible" 
              style={{ left: beginX, top: VIEWPORT_CENTER - TERMINAL_SIZE / 2 }}
            >
              <div className="size-[120px] shrink-0 rounded-full border-4 border-primary/40 bg-primary/5 flex items-center justify-center shadow-[0_0_50px_rgba(0,192,202,0.15)] group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-5xl text-primary font-bold">arrow_forward</span>
              </div>
              <div className="text-center w-max">
                <p className="text-xl font-bold text-white uppercase tracking-widest leading-tight">
                  Begin<br />System Testing
                </p>
              </div>
            </div>

            {/* Asset Cards */}
            {positionedAssets.length === 0 ? (
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-slate-800">playlist_remove</span>
                    <p className="text-slate-500 max-w-sm mx-auto uppercase tracking-widest font-bold">No Test Assets In This System</p>
                  </div>
               </div>
            ) : (
              positionedAssets.map((asset) => {
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
                    style={{ left: asset.x, top: asset.y }}
                  >
                    <div className={`px-4 py-2 border-b flex items-center justify-between ${isSelected ? 'bg-violet-400/10 border-violet-400/20' : 'bg-white/5 border-white/5'}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-violet-300' : 'text-slate-500'}`}>{asset.id}</span>
                        {asset.dependsOn && asset.dependsOn.length > 0 && (
                          <div className="flex gap-1">
                            {asset.dependsOn.map(p => (
                              <div key={p} className="size-1.5 rounded-full bg-violet-400/50" title={`Following ${p}`} />
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`size-2 rounded-full ${getStatusBg(asset.status)}`}></div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-bold text-base truncate transition-colors ${isSelected ? 'text-violet-100' : 'text-white group-hover:text-violet-400'}`}>
                          {asset.name}
                        </h4>
                        <span className={`material-symbols-outlined text-xl transition-all ${isSelected ? 'text-violet-400 scale-110' : 'text-slate-600'}`}>
                          {getStatusIcon(asset.status)}
                        </span>
                      </div>
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
              className={`absolute flex flex-col items-center gap-4 group w-[120px] overflow-visible ${onNavigateToParent ? 'cursor-pointer' : ''}`} 
              style={{ left: endX, top: VIEWPORT_CENTER - TERMINAL_SIZE / 2 }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (onNavigateToParent) onNavigateToParent();
              }}
            >
              <div className={`size-[120px] shrink-0 rounded-full border-4 bg-primary/5 flex items-center justify-center transition-all border-primary/40 shadow-[0_0_50px_rgba(0,192,202,0.15)] group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(0,192,202,0.25)]`}>
                <span className="material-symbols-outlined text-5xl font-bold text-primary">
                  logout
                </span>
              </div>
              <div className="text-center w-max">
                <p className="text-sm font-bold text-white uppercase tracking-widest leading-tight group-hover:text-primary transition-colors">
                  System Testing Complete:
                  <br />
                  <span className="text-[13px] font-bold text-primary mt-2 uppercase tracking-wide block">
                    {system.name}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestWorkflow;