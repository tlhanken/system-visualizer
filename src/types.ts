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
  testEngineerRE: string; // Responsible Engineer for the test
  dependsOn?: string[]; // IDs of test assets that must be completed before this one
}

export interface SystemNode {
  id: string;
  name: string;
  productEngineerRE: string; // Responsible Engineer for the product
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