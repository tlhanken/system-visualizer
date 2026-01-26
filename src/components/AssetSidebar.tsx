import React from 'react';
import { TestAsset, ReadinessStatus, SystemNode } from '../types';

interface AssetSidebarProps {
  selectedAsset: TestAsset | null;
  system: SystemNode;
  onSelectAsset?: (asset: TestAsset | null) => void;
}

const AssetSidebar: React.FC<AssetSidebarProps> = ({ selectedAsset, system, onSelectAsset }) => {
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

  return (
    <aside className="w-[420px] border-l border-white/10 bg-background-dark flex flex-col h-full overflow-hidden">
      {/* Header Section - Always visible */}
      <div className="p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`size-10 shrink-0 rounded-lg flex items-center justify-center border transition-all duration-300 ${
              selectedAsset 
                ? 'bg-violet-400/10 text-violet-400 border-violet-400/40 shadow-[0_0_15px_rgba(167,139,250,0.1)]' 
                : 'bg-primary/10 text-primary border-primary/20'
            }`}>
              <span className="material-symbols-outlined text-2xl font-bold">
                {selectedAsset ? 'biotech' : 'hub'}
              </span>
            </div>
            <div className="overflow-hidden">
              <h2 className="text-white text-lg font-bold tracking-tight truncate">
                {selectedAsset ? selectedAsset.name : system.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <div className={`size-1.5 rounded-full ${getStatusBg(selectedAsset ? selectedAsset.status : (system.status as ReadinessStatus))}`}></div>
                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] ${getStatusColor(selectedAsset ? selectedAsset.status : (system.status as ReadinessStatus))}`}>
                  {formatStatusLabel(selectedAsset ? selectedAsset.status : system.status)}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0">
            <span className={`text-[10px] px-2 py-1 font-bold tracking-tighter rounded border whitespace-nowrap transition-colors ${
              selectedAsset 
                ? 'bg-violet-400/20 text-violet-400 border-violet-400/30' 
                : 'bg-primary/20 text-primary border-primary/30'
            }`}>
              {selectedAsset ? selectedAsset.id : system.id}
            </span>
          </div>
        </div>
        
        <div className="relative rounded overflow-hidden border border-white/10 bg-slate-900 shadow-lg group">
          <img 
            alt="Technical Drawing" 
            className="w-full h-32 object-cover opacity-60 mix-blend-luminosity group-hover:opacity-80 transition-opacity" 
            src={system.imageUrl} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
          {selectedAsset && (
             <button 
              onClick={() => onSelectAsset?.(null)}
              className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950/80 border border-white/10 text-[9px] font-bold text-slate-400 hover:text-white hover:border-primary/50 transition-all backdrop-blur-sm"
             >
               <span className="material-symbols-outlined text-xs">arrow_back</span>
               BACK TO SYSTEM
             </button>
          )}
        </div>

        {/* Responsible Engineers People Section */}
        <div className="mt-4 pt-4 border-t border-white/5 bg-white/[0.02] p-3 rounded">
          <h3 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-blue-500 font-bold">person</span>
            People
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Product RE</span>
              <span className="text-white font-medium">{system.productEngineerRE}</span>
            </div>
            {selectedAsset && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5 mt-1">
                <span className="text-slate-400">Test RE</span>
                <span className="text-white font-medium">{selectedAsset.testEngineerRE}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {selectedAsset ? (
          /* Detailed Asset View */
          <section className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-6 border-b border-white/10 bg-slate-900/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-violet-400 text-sm">description</span>
                <h3 className="text-slate-200 text-[11px] font-bold tracking-widest uppercase">Asset Description</h3>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded border border-white/5 italic">
                "{selectedAsset.description}"
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary text-sm">hub</span>
                <h3 className="text-slate-200 text-[11px] font-bold tracking-widest uppercase">System Context</h3>
              </div>
              
              <div className="space-y-3">
                 <div className="flex items-center justify-between text-xs p-3 bg-slate-900/30 border border-white/5 rounded">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">System Parent</span>
                      <span className="text-slate-200 font-medium">{system.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-primary font-bold">{system.id}</span>
                 </div>
                 <div className="flex items-center justify-between text-xs p-3 bg-slate-900/30 border border-white/5 rounded">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Product RE</span>
                      <span className="text-slate-200 font-medium">{system.owner}</span>
                    </div>
                    <span className="material-symbols-outlined text-sm text-slate-500">person</span>
                 </div>
              </div>

              <div className="mt-8 opacity-20 text-center py-10">
                <span className="material-symbols-outlined text-4xl mb-2 text-slate-500">database</span>
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-slate-500">Extended Specs Vault Offline</p>
              </div>
            </div>
          </section>
        ) : (
          /* System Overview / Select an Asset View */
          <section className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-violet-400 text-sm">biotech</span>
                <h3 className="text-slate-200 text-[11px] font-bold tracking-widest uppercase">System Test Assets</h3>
              </div>
              <div className="space-y-3">
                {system.testAssets.map(asset => (
                  <div 
                    key={asset.id} 
                    onClick={() => onSelectAsset?.(asset)}
                    className="p-3 bg-slate-900/40 rounded border border-white/5 hover:border-violet-400/40 hover:bg-slate-800/60 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className={`material-symbols-outlined ${getStatusColor(asset.status)} text-lg mt-0.5 group-hover:text-violet-400 transition-colors`}>
                          {getStatusIcon(asset.status)}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-slate-200 group-hover:text-white">{asset.name}</p>
                          <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{asset.description}</p>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-600 font-mono">{asset.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border border-dashed border-white/5 rounded-lg text-center bg-white/[0.02]">
              <span className="material-symbols-outlined text-3xl mb-2 text-slate-700">touch_app</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Select a Test Asset to Inspect it in more detail</p>
            </div>
          </section>
        )}
      </div>
    </aside>
  );
};

export default AssetSidebar;