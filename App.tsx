
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { SystemNode, ReadinessStatus, RollupItem, TestAsset, Workspace } from './types';
import { INITIAL_WORKSPACES } from './data/mockSystems';
import { APP_VERSION, APP_NAME, APP_SUBTITLE } from './constants';
import Sidebar from './components/Sidebar';
import GraphCanvas, { getComputedNodeStatus } from './components/GraphCanvas';
import TestWorkflow from './components/TestWorkflow';
import AssetSidebar from './components/AssetSidebar';

interface SearchResult {
  type: 'system' | 'asset';
  system: SystemNode;
  asset?: TestAsset;
}

type FilterType = ReadinessStatus | 'NO_ASSETS' | 'SYSTEM' | 'ASSET';
type ViewTab = 'architecture' | 'workflow';

const App: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(INITIAL_WORKSPACES[0].id);
  const [activeTab, setActiveTab] = useState<ViewTab>('architecture');
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const activeWorkspace = useMemo(() => 
    workspaces.find(ws => ws.id === activeWorkspaceId) || workspaces[0],
  [workspaces, activeWorkspaceId]);

  const [selectedSystem, setSelectedSystem] = useState<SystemNode>(activeWorkspace.rootNode);
  const [selectedAsset, setSelectedAsset] = useState<TestAsset | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([activeWorkspace.rootNode.id]));
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<FilterType>>(new Set());
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const getAllNodeIds = useCallback((node: SystemNode): Set<string> => {
    const ids = new Set<string>();
    const traverse = (n: SystemNode) => {
      ids.add(n.id);
      n.subsystems?.forEach(traverse);
    };
    traverse(node);
    return ids;
  }, []);

  useEffect(() => {
    setSelectedSystem(activeWorkspace.rootNode);
    setExpandedNodes(getAllNodeIds(activeWorkspace.rootNode));
    setSelectedAsset(null);
  }, [activeWorkspace, getAllNodeIds]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedNodes(getAllNodeIds(activeWorkspace.rootNode));
  }, [activeWorkspace, getAllNodeIds]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  const handleCreateWorkspace = () => {
    const name = prompt('Enter project name:');
    if (!name) return;

    const id = `ws-${Date.now()}`;
    const newWs: Workspace = {
      id,
      name,
      rootNode: {
        id: `SYS-${id.slice(-3)}`,
        name: `${name} Root`,
        owner: 'Default Owner',
        status: ReadinessStatus.NOT_MADE,
        imageUrl: `https://picsum.photos/seed/${id}/600/400`,
        testAssets: [],
        subsystems: []
      }
    };

    setWorkspaces(prev => [...prev, newWs]);
    setActiveWorkspaceId(id);
    setIsWorkspaceDropdownOpen(false);
  };

  const getAssetRollupInternal = useCallback((node: SystemNode): RollupItem[] => {
    let results: RollupItem[] = node.testAssets.map(asset => ({
      system: node,
      asset
    }));

    if (node.subsystems) {
      node.subsystems.forEach(sub => {
        results = [...results, ...getAssetRollupInternal(sub)];
      });
    }
    return results;
  }, []);

  const rollupData = useMemo(() => {
    let results: RollupItem[] = [];
    if (selectedSystem.subsystems) {
      selectedSystem.subsystems.forEach(sub => {
        results = [...results, ...getAssetRollupInternal(sub)];
      });
    }
    return results;
  }, [selectedSystem, getAssetRollupInternal]);

  const performSearch = useCallback(() => {
    const query = searchQuery.toLowerCase();
    
    // Categorize active filters
    const typeFilters = new Set<FilterType>();
    const statusFilters = new Set<FilterType>();
    
    activeFilters.forEach(f => {
      if (f === 'SYSTEM' || f === 'ASSET') typeFilters.add(f);
      else statusFilters.add(f);
    });

    const hasTypeFilters = typeFilters.size > 0;
    const hasStatusFilters = statusFilters.size > 0;
    const hasQuery = query.length >= 2;
    
    if (!hasQuery && !hasTypeFilters && !hasStatusFilters) {
      setSearchResults([]);
      return;
    }

    const results: SearchResult[] = [];
    const traverse = (node: SystemNode) => {
      const computedStatus = getComputedNodeStatus(node);
      const nodeNoAssets = node.testAssets.length === 0;
      
      // Node (System) check
      let nodeMatchesType = !hasTypeFilters || typeFilters.has('SYSTEM');
      let nodeMatchesStatus = !hasStatusFilters || 
        statusFilters.has(computedStatus as unknown as FilterType) || 
        (statusFilters.has('NO_ASSETS') && nodeNoAssets);
      let nodeMatchesText = !hasQuery || 
        node.id.toLowerCase().includes(query) || 
        node.name.toLowerCase().includes(query);

      if (nodeMatchesType && nodeMatchesStatus && nodeMatchesText) {
        results.push({ type: 'system', system: node });
      }

      // Assets check
      node.testAssets.forEach(asset => {
        let assetMatchesType = !hasTypeFilters || typeFilters.has('ASSET');
        let assetMatchesStatus = !hasStatusFilters || statusFilters.has(asset.status as unknown as FilterType);
        let assetMatchesText = !hasQuery || 
          asset.name.toLowerCase().includes(query) || 
          asset.id.toLowerCase().includes(query);

        if (assetMatchesType && assetMatchesStatus && assetMatchesText) {
          results.push({ type: 'asset', system: node, asset });
        }
      });
      
      node.subsystems?.forEach(traverse);
    };

    traverse(activeWorkspace.rootNode);
    setSearchResults(results.slice(0, 40));
  }, [searchQuery, activeFilters, activeWorkspace]);

  useEffect(() => {
    performSearch();
  }, [searchQuery, activeFilters, performSearch]);

  const handleToggleFilter = (filter: FilterType) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      if (next.has(filter)) next.delete(filter);
      else next.add(filter);
      return next;
    });
  };

  const clearFilters = () => setActiveFilters(new Set());

  const getParentPath = useCallback((targetId: string): string[] => {
    const path: string[] = [];
    const find = (node: SystemNode, currentPath: string[]): boolean => {
      if (node.id === targetId) {
        path.push(...currentPath);
        return true;
      }
      if (node.subsystems) {
        for (const sub of node.subsystems) {
          if (find(sub, [...currentPath, node.id])) return true;
        }
      }
      return false;
    };
    find(activeWorkspace.rootNode, []);
    return path;
  }, [activeWorkspace]);

  const findNodeById = useCallback((node: SystemNode, id: string): SystemNode | null => {
    if (node.id === id) return node;
    if (node.subsystems) {
      for (const sub of node.subsystems) {
        const found = findNodeById(sub, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  const handleNavigateToParent = useCallback(() => {
    const path = getParentPath(selectedSystem.id);
    if (path.length > 0) {
      const parentId = path[path.length - 1];
      const parentNode = findNodeById(activeWorkspace.rootNode, parentId);
      if (parentNode) {
        setSelectedSystem(parentNode);
        setSelectedAsset(null);
      }
    }
  }, [selectedSystem.id, activeWorkspace.rootNode, getParentPath, findNodeById]);

  const hasParent = useMemo(() => {
    return getParentPath(selectedSystem.id).length > 0;
  }, [selectedSystem.id, getParentPath]);

  const handleSelectAsset = useCallback((asset: TestAsset | null, system?: SystemNode) => {
    if (system) {
      setSelectedSystem(system);
    }
    setSelectedAsset(asset);
    if (asset) {
      setActiveTab('workflow');
    }
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    const path = getParentPath(result.system.id);
    setExpandedNodes(prev => {
      const next = new Set(prev);
      path.forEach(id => next.add(id));
      return next;
    });
    setSelectedSystem(result.system);
    if (result.asset) {
      handleSelectAsset(result.asset, result.system);
    } else {
      setSelectedAsset(null);
      setActiveTab('architecture');
    }
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
    setIsFilterMenuOpen(false);
  };

  const getStatusColorClass = (status: ReadinessStatus) => {
    switch (status) {
      case ReadinessStatus.AVAILABLE: return 'bg-status-available shadow-[0_0_8px_#28A74566]';
      case ReadinessStatus.IN_PROGRESS: return 'bg-status-progress shadow-[0_0_8px_#FFC10766]';
      case ReadinessStatus.NOT_MADE: return 'bg-status-notmade shadow-[0_0_8px_#DC354566]';
      case ReadinessStatus.DEFERRED: return 'bg-status-deferred shadow-[0_0_8px_#A0A0A066]';
      default: return 'bg-slate-500';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (workspaceRef.current && !workspaceRef.current.contains(event.target as Node)) {
        setIsWorkspaceDropdownOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark text-slate-200">
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-3 bg-background-dark z-[100]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="size-8 flex items-center justify-center bg-primary/10 rounded">
              <span className="material-symbols-outlined text-2xl">account_tree</span>
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight">System<span className="text-primary">Visualizer</span></h1>
          </div>
          <nav className="flex items-center gap-6 h-full">
            <div className="relative" ref={workspaceRef}>
              <div 
                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer group px-3 py-1.5 rounded bg-white/5 border border-white/5 hover:border-white/10"
              >
                Project: <span className="text-white">{activeWorkspace.name}</span>
                <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${isWorkspaceDropdownOpen ? 'rotate-180' : ''}`}>expand_more</span>
              </div>

              {isWorkspaceDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-background-dark/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-1.5 mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Workspaces</span>
                  </div>
                  {workspaces.map(ws => (
                    <div 
                      key={ws.id}
                      onClick={() => {
                        setActiveWorkspaceId(ws.id);
                        setIsWorkspaceDropdownOpen(false);
                      }}
                      className={`px-4 py-2.5 flex items-center justify-between cursor-pointer group hover:bg-white/5 transition-colors ${activeWorkspaceId === ws.id ? 'bg-primary/10 border-r-2 border-primary' : ''}`}
                    >
                      <span className={`text-sm ${activeWorkspaceId === ws.id ? 'text-primary font-bold' : 'text-slate-300 group-hover:text-white'}`}>
                        {ws.name}
                      </span>
                      {activeWorkspaceId === ws.id && (
                        <span className="material-symbols-outlined text-primary text-sm">check</span>
                      )}
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-white/10 px-2">
                    <button 
                      onClick={handleCreateWorkspace}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-xs font-bold text-primary hover:bg-primary/10 transition-colors uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-base">add</span>
                      New Project
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 self-stretch">
              <button 
                onClick={() => setActiveTab('architecture')}
                className={`relative px-3 py-1 text-sm font-medium transition-all flex items-center h-full ${
                  activeTab === 'architecture' ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                System Architecture
                {activeTab === 'architecture' && (
                  <div className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_#00c0ca]"></div>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('workflow')}
                className={`relative px-3 py-1 text-sm font-medium transition-all flex items-center h-full ${
                  activeTab === 'workflow' ? 'text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Test Workflow
                {activeTab === 'workflow' && (
                  <div className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-primary shadow-[0_0_8px_#00c0ca]"></div>
                )}
              </button>
            </div>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-[520px] group flex items-center gap-2" ref={searchRef}>
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-lg group-focus-within:text-primary transition-colors">search</span>
              <input 
                className="w-full bg-slate-900 border border-white/10 rounded px-10 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-slate-600" 
                placeholder="Search systems or test assets..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
              />
              {(searchQuery || activeFilters.size > 0) && (
                 <button 
                  onClick={() => { setSearchQuery(''); clearFilters(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                 >
                   <span className="material-symbols-outlined text-base">cancel</span>
                 </button>
              )}
            </div>

            <div className="relative" ref={filterRef}>
              <button 
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                className={`flex items-center justify-center p-2 rounded border transition-all ${
                  activeFilters.size > 0 
                  ? 'border-primary/50 bg-primary/10 text-primary shadow-[0_0_10px_rgba(0,192,202,0.2)]' 
                  : 'border-white/10 bg-slate-900 text-slate-500 hover:text-white hover:border-white/20'
                }`}
              >
                <span className="material-symbols-outlined text-xl">filter_list</span>
                {activeFilters.size > 0 && (
                  <span className="absolute -top-1 -right-1 size-4 bg-primary text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center border border-slate-950">
                    {activeFilters.size}
                  </span>
                )}
              </button>

              {isFilterMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-background-dark/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl p-4 z-[200] animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <span className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">Search Filters</span>
                    {activeFilters.size > 0 && (
                      <button onClick={clearFilters} className="text-[10px] text-primary hover:underline font-bold">Clear All</button>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Result Type</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'SYSTEM', label: 'Systems', icon: 'hub' },
                        { id: 'ASSET', label: 'Assets', icon: 'biotech' },
                      ].map(f => (
                        <button 
                          key={f.id}
                          onClick={() => handleToggleFilter(f.id as FilterType)}
                          className={`flex flex-col items-center gap-1.5 p-2 rounded border transition-all ${
                            activeFilters.has(f.id as FilterType) 
                            ? 'bg-primary/10 border-primary/40 text-white' 
                            : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl">{f.icon}</span>
                          <span className="text-[10px] font-bold uppercase tracking-tighter">{f.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 ml-1">Readiness Level</span>
                    <div className="space-y-1">
                      {[
                        { id: ReadinessStatus.AVAILABLE, label: 'Available', color: 'bg-status-available' },
                        { id: ReadinessStatus.IN_PROGRESS, label: 'In Progress', color: 'bg-status-progress' },
                        { id: ReadinessStatus.NOT_MADE, label: 'Pending', color: 'bg-status-notmade' },
                        { id: ReadinessStatus.DEFERRED, label: 'Deferred', color: 'bg-status-deferred' },
                        { id: 'NO_ASSETS', label: 'No Test Assets', icon: 'visibility_off' },
                      ].map(f => (
                        <div 
                          key={f.id}
                          onClick={() => handleToggleFilter(f.id as FilterType)}
                          className={`flex items-center gap-3 px-3 py-1.5 rounded cursor-pointer transition-colors ${
                            activeFilters.has(f.id as FilterType) 
                            ? 'bg-primary/10 text-white' 
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                          }`}
                        >
                          {f.color ? (
                            <div className={`size-2.5 rounded-full ${f.color} ${activeFilters.has(f.id as FilterType) ? 'ring-2 ring-primary/20 ring-offset-1 ring-offset-background-dark' : ''}`}></div>
                          ) : (
                            <span className="material-symbols-outlined text-sm">{f.icon}</span>
                          )}
                          <span className="text-xs font-medium">{f.label}</span>
                          {activeFilters.has(f.id as FilterType) && (
                            <span className="material-symbols-outlined text-primary text-base ml-auto">check_small</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {(isSearchFocused || isFilterMenuOpen) && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background-dark/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden z-[150] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  <div className="px-3 py-2 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Results</span>
                    <span className="text-[10px] font-bold text-slate-400">{searchResults.length} Match{searchResults.length !== 1 ? 'es' : ''}</span>
                  </div>
                  {searchResults.map((result, idx) => {
                    const status = result.type === 'asset' ? result.asset!.status : getComputedNodeStatus(result.system);
                    return (
                      <div 
                        key={`${result.system.id}-${result.asset?.id || 'sys'}-${idx}`}
                        onClick={() => handleSelectResult(result)}
                        className="p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 flex items-center gap-4 group transition-colors"
                      >
                        <div className={`size-9 rounded-lg flex items-center justify-center transition-colors ${result.type === 'asset' ? 'bg-violet-400/10 text-violet-400' : 'bg-primary/10 text-primary'}`}>
                          <span className="material-symbols-outlined text-xl">
                            {result.type === 'asset' ? 'biotech' : 'hub'}
                          </span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">
                              {result.type === 'asset' ? result.asset?.name : result.system.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${result.type === 'asset' ? 'border-violet-400/30 text-violet-400/80 bg-violet-400/5' : 'border-primary/30 text-primary/80 bg-primary/5'} uppercase tracking-tighter`}>
                                {result.type === 'asset' ? 'Test Asset' : 'System'}
                              </span>
                              <div 
                                className={`size-2 rounded-full ${getStatusColorClass(status)}`}
                                title={`Status: ${status}`}
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                            {result.type === 'asset' ? (
                              <>
                                <span className="material-symbols-outlined text-[10px]">subdirectory_arrow_right</span>
                                System: <span className="text-slate-300">{result.system.name}</span>
                              </>
                            ) : (
                              <>
                                ID: <span className="text-slate-300 font-mono">{result.system.id}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className="size-8 rounded-full bg-slate-700 border border-primary/50 overflow-hidden">
               <img src="https://picsum.photos/seed/user/100" alt="Avatar" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'architecture' ? (
          <>
            <GraphCanvas 
              rootNode={activeWorkspace.rootNode} 
              selectedId={selectedSystem.id} 
              onSelect={setSelectedSystem}
              expandedNodes={expandedNodes}
              onToggleExpand={toggleExpand}
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
              searchQuery={searchQuery}
            />
            
            <Sidebar 
              selectedSystem={selectedSystem} 
              rollupData={rollupData} 
              onSelectAsset={handleSelectAsset}
            />
          </>
        ) : (
          <>
            <TestWorkflow 
              system={selectedSystem} 
              selectedAssetId={selectedAsset?.id || null}
              onSelectAsset={(asset) => handleSelectAsset(asset, selectedSystem)}
              onNavigateToParent={hasParent ? handleNavigateToParent : undefined}
            />
            <AssetSidebar 
              selectedAsset={selectedAsset}
              system={selectedSystem}
              onSelectAsset={(asset) => handleSelectAsset(asset, selectedSystem)}
            />
          </>
        )}
      </main>

      <footer className="h-8 border-t border-white/5 bg-slate-950 px-4 flex items-center justify-end text-[10px] font-bold tracking-widest text-slate-500">
        <div className="flex items-center gap-4">
          <span className="uppercase">{APP_NAME} v{APP_VERSION}</span>
          <span className="text-primary/60 uppercase">View Only</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
