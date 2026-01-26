import React, { useMemo } from 'react';
import { SystemNode, RollupItem, ReadinessStatus, TestAsset } from '../types';
import { getComputedNodeStatus } from './GraphCanvas';

interface SidebarProps {
  selectedSystem: SystemNode;
  rollupData: RollupItem[];
  onSelectAsset?: (asset: TestAsset, system: SystemNode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedSystem, rollupData, onSelectAsset }) => {
  const getStatusColor = (status: ReadinessStatus) => {
    switch (status) {
      case ReadinessStatus.AVAILABLE: return 'text-status-available';
      case ReadinessStatus.IN_PROGRESS: return 'text-status-progress';
      case ReadinessStatus.NOT_MADE: return 'text-status-notmade';
      case ReadinessStatus.DEFERRED: return 'text-status-deferred';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = (status: ReadinessStatus) => {
    switch (status) {
      case ReadinessStatus.AVAILABLE: return 'bg-status-available';
      case ReadinessStatus.IN_PROGRESS: return 'bg-status-progress';
      case ReadinessStatus.NOT_MADE: return 'bg-status-notmade';
      case ReadinessStatus.DEFERRED: return 'bg-status-deferred';
      default: return 'bg-slate-400';
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

  const formatStatusLabel = (status: string) => {
    if (status === ReadinessStatus.NOT_MADE) return 'PENDING';
    return status.replace(/_/g, ' ');
  };

  const computedSystemStatus = getComputedNodeStatus(selectedSystem);

  const localAssetCounts = useMemo(() => {
    const counts = {
      [ReadinessStatus.AVAILABLE]: 0,
      [ReadinessStatus.IN_PROGRESS]: 0,
      [ReadinessStatus.NOT_MADE]: 0,
      [ReadinessStatus.DEFERRED]: 0,
    };
    selectedSystem.testAssets.forEach(a => {
      counts[a.status]++;
    });
    return counts;
  }, [selectedSystem.testAssets]);

  const rollupAssetCounts = useMemo(() => {
    const counts = {
      [ReadinessStatus.AVAILABLE]: 0,
      [ReadinessStatus.IN_PROGRESS]: 0,
      [ReadinessStatus.NOT_MADE]: 0,
      [ReadinessStatus.DEFERRED]: 0,
    };
    rollupData.forEach(item => {
      counts[item.asset.status]++;
    });
    return counts;
  }, [rollupData]);

  const groupedRollup = rollupData.reduce((acc, item) => {
    if (!acc[item.asset.status]) acc[item.asset.status] = [];
    acc[item.asset.status].push(item);
    return acc;
  }, {} as Record<ReadinessStatus, RollupItem[]>);

  return (
    <aside className="w-[420px] border-l border-white/10 bg-background-dark flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="size-10 shrink-0 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
              <span className="material-symbols-outlined text-2xl font-bold">hub</span>
            </div>
            <div className="overflow-hidden">
              <h2 className="text-white text-lg font-bold tracking-tight truncate">{selectedSystem.name}</h2>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase truncate">System Test Assets</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 font-bold tracking-tighter rounded border border-primary/30">ID: {selectedSystem.id}</span>
            <div className={`text-[9px] font-bold uppercase tracking-widest ${getStatusColor(computedSystemStatus)}`}>
              {formatStatusLabel(computedSystemStatus)}
            </div>
          </div>
        </div>
        <div className="relative rounded overflow-hidden border border-white/10 bg-slate-900 shadow-lg group">
          <img 
            alt="Technical Drawing" 
            className="w-full h-32 object-cover opacity-60 mix-blend-luminosity group-hover:opacity-80 transition-opacity" 
            src={selectedSystem.imageUrl} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
        </div>

        {/* Responsible Engineers People Section */}
        <div className="mt-4 pt-4 border-t border-white/5 bg-white/[0.02] p-3 rounded">
          <h3 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-blue-500 font-bold">person</span>
            People
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Product Engineer RE</span>
              <span className="text-white font-medium">{selectedSystem.productEngineerRE}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <section className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-400 text-sm">biotech</span>
              <h3 className="text-slate-200 text-[11px] font-bold tracking-widest uppercase">Local Test Assets</h3>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
              <span className="text-status-available" title="Available">{localAssetCounts[ReadinessStatus.AVAILABLE]}</span>
              <span className="text-slate-600">/</span>
              <span className="text-status-progress" title="In Progress">{localAssetCounts[ReadinessStatus.IN_PROGRESS]}</span>
              <span className="text-slate-600">/</span>
              <span className="text-status-notmade" title="Pending">{localAssetCounts[ReadinessStatus.NOT_MADE]}</span>
              <span className="text-slate-600">/</span>
              <span className="text-status-deferred" title="Deferred">{localAssetCounts[ReadinessStatus.DEFERRED]}</span>
            </div>
          </div>
          <div className="space-y-3">
            {selectedSystem.testAssets.length === 0 && (
              <p className="text-xs text-slate-500 italic">No direct test assets for this node.</p>
            )}
            {selectedSystem.testAssets.map(asset => (
              <div 
                key={asset.id} 
                onClick={() => onSelectAsset?.(asset, selectedSystem)}
                className="p-3 bg-slate-900/40 rounded border border-white/5 hover:border-primary/40 hover:bg-slate-800/60 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined ${getStatusColor(asset.status)} text-lg mt-0.5 group-hover:scale-110 transition-transform`}>
                      {getStatusIcon(asset.status)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-primary transition-colors">{asset.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400">{asset.description}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-[9px] font-bold ${getStatusColor(asset.status)} border border-current uppercase`}>
                    {formatStatusLabel(asset.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 bg-slate-900/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-400 text-sm">account_tree</span>
              <h3 className="text-slate-200 text-[11px] font-bold tracking-widest uppercase font-display">Subsystem Test Asset Rollup</h3>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] font-bold">
              <span className="text-status-available" title="Available Rollup">{rollupAssetCounts[ReadinessStatus.AVAILABLE]}</span>
              <span className="text-slate-600">/</span>
              <span className="text-status-progress" title="In Progress Rollup">{rollupAssetCounts[ReadinessStatus.IN_PROGRESS]}</span>
              <span className="text-slate-600">/</span>
              <span className="text-status-notmade" title="Pending Rollup">{rollupAssetCounts[ReadinessStatus.NOT_MADE]}</span>
              <span className="text-slate-600">/</span>
              <span className="text-status-deferred" title="Deferred Rollup">{rollupAssetCounts[ReadinessStatus.DEFERRED]}</span>
            </div>
          </div>
          
          <div className="space-y-6">
            {(Object.entries(groupedRollup) as [ReadinessStatus, RollupItem[]][]).map(([status, items]) => (
              <div key={status} className="space-y-2">
                <div className={`text-[9px] ${getStatusColor(status)} font-bold tracking-widest uppercase pl-1 border-l border-current/30`}>
                  {formatStatusLabel(status)}
                </div>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div 
                      key={`${item.asset.id}-${idx}`} 
                      onClick={() => onSelectAsset?.(item.asset, item.system)}
                      className="relative flex items-center justify-between text-xs p-2.5 bg-slate-900/30 border border-white/5 rounded cursor-pointer hover:border-primary/40 hover:bg-slate-800/60 transition-all group"
                    >
                      {/* Stylized Tooltip Pop-up */}
                      <div className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-background-dark border border-primary/30 rounded p-5 shadow-2xl opacity-0 scale-95 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 pointer-events-none transition-all duration-300 z-[110] backdrop-blur-xl">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm text-slate-400 font-bold leading-tight uppercase tracking-tight">{item.system.name}</span>
                            <span className="text-xl text-white font-bold leading-tight flex items-center gap-2">
                              <span className="material-symbols-outlined text-base text-violet-400">subdirectory_arrow_right</span>
                              {item.asset.name}
                            </span>
                          </div>
                          {item.asset.description && (
                            <p className="mt-2 text-sm text-slate-500 leading-relaxed italic line-clamp-4 border-t border-white/5 pt-2">
                              {item.asset.description}
                            </p>
                          )}
                        </div>
                        <div className="absolute top-full left-6 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-primary/30"></div>
                      </div>

                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className={`size-2 shrink-0 rounded-full ${getStatusBg(status)}`}></div>
                        <span className="text-slate-200 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] group-hover:text-primary transition-colors">
                          {item.system.name}: <span className="text-slate-400 font-normal group-hover:text-slate-200">{item.asset.name}</span>
                        </span>
                      </div>
                      <span className={`text-[9px] font-bold ${getStatusColor(status)} opacity-80 uppercase shrink-0`}>
                        {formatStatusLabel(status)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {rollupData.length === 0 && <p className="text-xs text-slate-500 italic">No assets found in subsystem hierarchy.</p>}
          </div>
        </section>
      </div>
    </aside>
  );
};

export default Sidebar;