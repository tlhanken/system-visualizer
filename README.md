# System Visualizer

A web-based tool for visualizing system architectures, managing readiness status, and tracking test assets. This application allows users to explore hierarchical system nodes, view their status, and manage associated test workflows.

## Features

- **System Hierarchy**: Visualize complex system architectures in a recursive tree structure.
- **Status Tracking**: Computed status based on test assets (Available, In Progress, Not Made, Deferred).
- **Test Assets**: Manage test workflows and assets attached to systems.
- **Rollups**: View aggregated stats and assets for high-level systems.
- **Search**: Smart filtering by system, asset, status, and more.

## Development

This project uses **Nix** for a reproducible development environment and **Just** for command automation.

### Prerequisites

- [Nix](https://nixos.org/download.html)
- [Direnv](https://direnv.net/)

### Getting Started

1.  **Enter the environment**:
    ```bash
    direnv allow
    # or
    nix develop
    ```

2.  **Install dependencies**:
    ```bash
    just install
    ```

3.  **Run the application**:
    ```bash
    just dev
    ```
    This runs both the Vite frontend and the Express backend concurrently.

## Documentation

- **[Specifications](./specifications.md)**: Detailed functional and visual specifications for the project.
- **[Agent Instructions](./agents.md)**: Guidelines for AI agents working on this codebase.

## Project Structure

- `src/`: React frontend (Vite)
- `server/`: Backend server (Express)
- `systems/`: System definitions and data
