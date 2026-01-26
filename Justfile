# System Visualizer Justfile

default:
    @just --list

# Install dependencies
install:
    cd src && npm install

# Run development server
dev:
    cd src && npm run dev

# Build for production
build:
    cd src && npm run build

# Preview production build
preview:
    cd src && npm run preview
