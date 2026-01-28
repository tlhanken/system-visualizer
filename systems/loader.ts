import { SystemNode, Workspace } from '../src/types';

// Define the type for the module imported via import.meta.glob
type SystemModule = {
    default: SystemNode;
    [key: string]: any;
};

// Helper to create a Workspace from a SystemNode
const createWorkspace = (system: SystemNode, folderName: string, index: number, source: 'Example' | 'Private'): Workspace => {
    return {
        id: `ws-${source.toLowerCase()}-${index}`,
        name: folderName,
        rootNode: system
    };
};

export const loadSystems = (): Workspace[] => {
    const workspaces: Workspace[] = [];

    // Load all systems from the current directory recursively
    const modules = import.meta.glob<SystemModule>('./**/*.ts', {
        eager: true
    });

    Object.entries(modules).forEach(([path, mod], index) => {
        // Skip this loader file itself
        if (path.includes('loader.ts')) return;

        if (mod.default) {
            // Determine source based on path
            // Check if the path contains 'Example' (case sensitive based on user folder naming)
            const isExample = path.includes('Example');
            const source = isExample ? 'Example' : 'Private';

            // Extract folder name from path: ./FolderName/index.ts
            const pathParts = path.split('/');
            // pathParts[0] is '.', pathParts[1] is FolderName
            const folderName = pathParts[1];

            workspaces.push(createWorkspace(mod.default, folderName, index, source));
        }
    });

    return workspaces;
};

export const INITIAL_WORKSPACES: Workspace[] = loadSystems();
