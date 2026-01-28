# System Visualizer Specifications

## Overview
A web-based tool for visualizing system architectures, managing readiness status, and tracking test assets. The application allows users to explore hierarchical system nodes, view their status, and manage associated test workflows.

## Visual Specifications

### Color System & Theming
The visual language uses specific colors to denote different types of entities:

*   **Systems**: **Cyan/Teal** (`#00C0CA`). Used for system nodes, hierarchy lines, and primary actions.
    *   *Usage*: Node outlines (selected), Primary buttons, "System" badges.
*   **Test Assets**: **Violet/Purple** (`#A78BFA`). Used for test workflows, asset lists, and lab-related items.
    *   *Usage*: Workflow tabs, Asset icons (`biotech`), "Test Asset" badges.
*   **People**: **Royal Blue** (`#3B82F6`). Used for user roles, owners, and responsible engineers.
    *   *Usage*: Person icons, RE (Responsible Engineer) logic.
*   **Status Indicators**:
    *   **Available**: Green (Success, Done).
    *   **In Progress**: Yellow/Amber (Active, WIP).
    *   **Not Made**: Red (Pending, Blocked).
    *   **Deferred**: Grey (Inactive, N/A).

### Component Design

#### 1. System Node (Graph Canvas)
*   **Appearance**: Rectangular card (`240px` x `160px`) with a background image.
*   **States**:
    *   *Default*: Dark background, subtle border.
    *   *Ready/InProgress*: Full colored border indicating status.
    *   *Selected*: Glowing **Cyan** outline with shadow.
    *   *Match*: Yellow pulse animation during search.
*   **Content**:
    *   Background image with overlay.
    *   Status icon in top-right.
    *   System Name and Owner.
    *   Subsystem count badge (if children exist).
*   **Interactions**:
    *   **Expand/Collapse**: Circular toggle button on the left edge.
    *   **Selection**: Clicking centers the camera and opens the Sidebar.

#### 2. Details Sidebar
*   **Header**:
    *   Large System Icon (**Cyan**) or Asset Icon (**Purple**).
    *   Title and ID badge.
    *   "People" section showing `Product Engineer RE` (**Royal Blue** icon).
    *   Background image banner with gradient overlay.
*   **Lists**:
    *   **Local Assets**: Direct children of the selected node.
    *   **Rollup Assets**: Aggregated view of all subsystems' assets.
*   **Rollup Items**:
    *   Row showing System Name + Asset Name.
    *   **Tooltip**: Custom hover pop-up showing full description and hierarchy context.

#### 3. Asset Sidebar (Workflow View)
*   **Header**:
    *   Similar to System Sidebar but highlights the specific Asset in **Purple**.
    *   Includes "People" section with both `Product RE` and `Test RE`.
*   **Description View**:
    *   Italicized description block.
    *   System Context block showing Parent System and Owner.
    *   "Extended Specs Vault" placeholder (visual only).

#### 4. Navigation & HUD
*   **Zoom/Pan**: Infinite canvas with smooth zoom (0.2x to 3x).
*   **Minimap/Legend**:
    *   Floating panel top-left showing status color keys.
    *   "Expand All" / "Collapse All" shortcuts.
*   **Bottom Controls**:
    *   "Focus Selected" button.
    *   Zoom In/Out buttons.

## Functional Specifications

### Workspace Management
*   **Project Isolation**: Multiple workspaces (`Workspace[]`) with unique IDs.
*   **Switching**: Dropdown in header to switch active projects.
*   **Creation**: "New Project" button prompts for name, generates default root node structure.

### System Hierarchy & Logic
*   **Tree Structure**: recursive `SystemNode` structure.
*   **Computed Status**:
    *   A System's status is derived from its **Test Assets**.
    *   Logic:
        *   All Assets Deferred -> **DEFERRED**.
        *   All Assets Available (or Deferred) -> **AVAILABLE**.
        *   All Assets Not Made -> **NOT_MADE**.
        *   Mixed -> **IN_PROGRESS**.

### Test Assets
*   **Definition**: `TestAsset` items attached to Systems.
*   **Metadata**: `id`, `name`, `status`, `description`, `testEngineerRE`.
*   **Rollups**: The Sidebar must recursively traverse all subsystems to show a complete list of required tests for a high-level system.

### Search Engine
*   **Scope**: Searches both Systems and Test Assets.
*   **Smart Filtering**:
    *   `Type`: Filter by System vs Asset.
    *   `Status`: Filter by specific readiness states.
    *   `Empty State`: Filter for "No Assets" to find unpopulated nodes.
*   **Behavior**:
    *   Typing (>2 chars) updates results in real-time.
    *   Clicking a result:
        1.  Expands the path to the node.
        2.  Centers the graph on the node.
        3.  Selects the node (and asset if applicable).
        4.  Switches views if needed.
