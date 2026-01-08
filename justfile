# justfile for kylesnowschwartz.github.io (Astro + GitHub Pages)

# Default: show available recipes
default:
    @just --list

# Start dev server
dev:
    npm run dev

# Start dev server and open in browser
dev-open:
    #!/usr/bin/env bash
    trap 'kill $(jobs -p) 2>/dev/null' EXIT
    npm run dev &
    sleep 2
    open http://localhost:4321
    wait

# Build for production
build:
    npm run build

# Preview production build locally
preview:
    npm run build && npm run preview

# Type-check the project
check:
    npx astro check

# Deploy to GitHub Pages (via git push)
deploy:
    git push origin main

# Clean build artifacts
clean:
    rm -rf dist .astro node_modules/.vite

# Fresh install and build
rebuild:
    rm -rf node_modules package-lock.json
    npm install
    npm run build
