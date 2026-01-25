
export enum ReadinessStatus {
  AVAILABLE = 'AVAILABLE',
  IN_PROGRESS = 'IN_PROGRESS',
  NOT_MADE = 'NOT_MADE',
  DEFERRED = 'DEFERRED'
}

export interface TestAsset {
  id: string;
  name: string;
  status: ReadinessStatus;
  description: string;
}

export interface SystemNode {
  id: string;
  name: string;
  owner: string;
  status: ReadinessStatus;
  imageUrl: string;
  subsystems?: SystemNode[];
  testAssets: TestAsset[];
  parentId?: string;
}

export interface RollupItem {
  system: SystemNode;
  asset: TestAsset;
}

export interface Workspace {
  id: string;
  name: string;
  rootNode: SystemNode;
}
